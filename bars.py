from flask import Flask, render_template, g, request, redirect, url_for, jsonify
import sqlite3
import os
import json
import datetime
import quadrant
from werkzeug.exceptions import BadRequest
import pickle


app = Flask(__name__)

# USE FOR DEBUGGING ONLY
import pprint
pp = pprint.PrettyPrinter(indent=4)

# constants
# DATABASE = os.path.join(os.path.curdir, 'sql', 'hiv2_drug_assay.db')
app.config['DATABASE'] = os.path.join(os.path.curdir, 'sql', 'hiv2_drug_assay.db')

# creates database
def create_db():
    with open(os.path.join(os.path.curdir, 'sql', 'create_tables.sql'), 'r') as file:
        queries = file.read()

        conn = sqlite3.connect(app.config['DATABASE'])
        cur = conn.cursor()

        cur.executescript(queries)
        conn.commit()
        cur.close()
        conn.close()


# gets database from flask settings
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.isolation_level = None

    return db


# executes query in database, accepts arguments to protect against SQL injection
# 'one' param return first result, which by default is turned off
def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)

    rv = cur.fetchall()
    cur.close()

    return (rv[0] if rv else None) if one else rv


# provided param is in MM/DD/YYYY. Correct format will be returned as datetime.date(YYYY, MM, DD)
def format_date(date_str):
    date_sep = date_str.split('/')

    month = int(date_sep[0])
    day = int(date_sep[1])
    year = int(date_sep[2])

    return datetime.date(year, month, day)


# returns the column names of given tables
def get_column_names(tbl_name, full_name):
    fields = []
    for name in tbl_name:
        field = query_db("PRAGMA table_info(" + name + ")")
        for x in field:
            # gets column name
            if full_name:
                fields.append(name + "_" + x[1])
            else:
                fields.append(x[1])

    return fields


# formats the query response into an array of dict in order to align with JSON formatting
def format_resp(resp, tbl_name, full_name=False):
    fields = get_column_names(tbl_name, full_name)

    formatted_resp = []
    for x in resp:
        obj = {fields[i]: val for (i, val) in enumerate(x)}
        formatted_resp.append(obj)

    return formatted_resp


# inserts into db by executing given query and optional args
def insert_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(query, args)
    conn.commit()


# updates db by executing given query and optional args
def update_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(query, args)
    conn.commit()


# adds a clone into the Clone table if not exists, given arguments
def add_clone(args, edit=False):
    try:
        if not edit:
            check = query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)
            if len(check) > 0:
                return False

            insert_db("INSERT INTO Clone(name, aa_changes, type, purify_date) VALUES(?, ?, ?, ?)", args=args)

            return query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)[0][0]
        else:
            update_db("UPDATE Clone SET name=?, aa_changes=?, type=?, purify_date=? WHERE id=?", args=args)

            return True

    except Exception as e:
        print("Error: ", e)
        raise BadRequest(e)


# adds a virus stock into the Virus stock if not exists, given arguments
def add_stock(args, edit=False):
    try:
        if not edit:
            check = query_db("SELECT id FROM Virus_Stock WHERE harvest_date=? AND clone=?", args=args[0:len(args) - 1])
            if len(check) > 0:
                return False

            insert_db("INSERT INTO Virus_Stock(harvest_date, clone, ffu_per_ml) VALUES(?, ?, ?)", args=args)

            return True
        else:
            update_db("UPDATE Virus_Stock SET harvest_date=?, clone=?, ffu_per_ml=? WHERE id=?", args=args)

            return True

    except:
        raise BadRequest("OH NO")


# adds a drug into the Drug table if not exists, given arguments
def add_drug(args):
    try:
        check = query_db("SELECT id FROM Drug WHERE name=? AND abbreviation=?", args=args)
        if len(check) > 0:
            return False

        insert_db("INSERT INTO Drug(name, abbreviation) VALUES(?, ?)", args=args)

        return "success"

    except Exception as e:
        print(e)
        raise BadRequest(e)


# adds a quadrant into the Quadrant table, given arguments
def add_quadrant(cur, args):
    try:
        cur.execute("INSERT INTO Quadrant(virus_stock, drug, concentration_range, num_controls, q_abs)"
                  " VALUES(?, ?, ?, ?, ?)", args)

        print("Entering into quadrant", query_db("SELECT id FROM Quadrant ORDER BY id DESC LIMIT 1;")[0][0])

        return query_db("SELECT id FROM Quadrant ORDER BY id DESC LIMIT 1;")[0][0]

    except Exception as e:
        raise BadRequest("OH NO...I'm in add_quadrant")


# adds a row into the Plate to Quadrant table, given arguments
def add_plate(cur, args):
    try:
        cur.execute("INSERT INTO Plate_Reading(name, read_date, letter) VALUES(?, ?, ?)", args)

        print("Entering into plate_reading", query_db("SELECT id FROM Plate_Reading ORDER BY id DESC LIMIT 1;")[0][0])

        return query_db("SELECT id FROM Plate_Reading ORDER BY id DESC LIMIT 1;")[0][0]

    except Exception as e:
        raise BadRequest("OH NO...I'm in add_plate")


# adds a plate into the Plate_reading table if does not already exist, given arguments
def add_plate_and_quadrants(plate, quads):
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("BEGIN")

        ids = []
        for q in quads:
            if q:
                ids.append(add_quadrant(cur, q))
            else:
                ids.append(-1)

        check = query_db("SELECT id FROM Plate_Reading WHERE name=? AND read_date=? AND letter=?", plate)
        if len(check) > 0:
            return False

        plate_id = add_plate(cur, plate)
        for i in range(0, len(ids)):
            cur.execute("INSERT INTO Plate_to_Quadrant(plate_id, quad_location, quad) "
                      " VALUES(?, ?, ?)", [plate_id, i, ids[i]])

    except Exception as e:
        cur.execute("ROLLBACK")
        conn.rollback()
        print("Rolling back...")
        print("Error: ", e)
        raise BadRequest(e)

    else:
        cur.execute("COMMIT")
        conn.commit()
        return plate_id


# converts date from datetime into MM/DD/YYYY format
def convert_date(date):
    d = date.split('-')
    return d[1] + '/' + d[2] + '/' + d[0]


# index.html
@app.route('/')
def index():
    return render_template('index.html')


# manage.html
# adds virus stocks and drugs
@app.route('/manage')
def manage():
    return render_template('manage.html')


# enter_assay.html
# form to enter 96 well assay results
@app.route('/enter_assay')
def enter_assay():
    return render_template('enter_assay.html')


# analysis.html
# will return a custom page for each quadrant analysis
@app.route('/analysis', defaults={'plate_id': None})
@app.route('/analysis/<int:plate_id>')
def analysis(plate_id):
    return render_template('analysis.html', plate_id=plate_id)


# overview.html
# will return a selection menu to show all experiments
@app.route('/overview')
def overview():
    return render_template('overview.html')


# edit.html
# prototyping multiple inputs and editing
@app.route('/edit')
def edit():
    return render_template('edit.html')


# edit_clone.html
@app.route('/edit_clone/<int:clone_id>')
def edit_clone(clone_id):
    return render_template('edit_clone.html')


# edit_clone.html
@app.route('/edit_stock/<int:stock_id>')
def edit_stock(stock_id):
    return render_template('edit_stock.html')


# GET request to get all plates
@app.route('/get_all_plates', methods=['GET'])
def get_all_plates():
    q = query_db("SELECT * FROM Plate_Reading");
    resp = format_resp(q, ['Plate_Reading'])

    for x in resp:
        x['read_date'] = convert_date(x['read_date'])

    return json.dumps(resp)


# GET request to get all plates with complete information
@app.route('/get_all_plate_quadrants', methods=['GET'])
def get_all_plate_quadrants():
    data_raw = query_db("SELECT * FROM Plate_Reading AS a "
                        "JOIN Plate_to_Quadrant AS b ON a.id=b.plate_id "
                        "JOIN Quadrant AS c ON b.quad=c.id "
                        "JOIN Virus_Stock AS d ON c.virus_stock=d.id "
                        "JOIN Clone AS e ON d.clone=e.id "
                        "JOIN Drug As f ON c.drug=f.id")

    data_parsed = format_resp(data_raw, ['Plate_Reading', 'Plate_to_Quadrant', 'Quadrant', 'Virus_Stock', 'Clone', 'Drug'], True)

    for index, q in enumerate(data_parsed):
        q_data = [q['Quadrant_virus_stock'],
                  q['Quadrant_drug'],
                  pickle.loads(q['Quadrant_concentration_range']),
                  q['Quadrant_num_controls'],
                  pickle.loads(q['Quadrant_q_abs'])]

        quad = quadrant.Quadrant(*q_data)

        q['Clone_purify_date'] = convert_date(q['Clone_purify_date'])
        q['Plate_Reading_read_date'] = convert_date(q['Plate_Reading_read_date'])
        q['Virus_Stock_harvest_date'] = convert_date(q['Virus_Stock_harvest_date'])
        q['Quadrant_q_abs'] = quad.parse_vals()
        q['Quadrant_concentration_range'] = quad.calc_c_range()
        q['regression'] = quad.sigmoidal_regression()

    return json.dumps(data_parsed)


# POST request to enter a new stock
@app.route('/create_stock', methods=['POST'])
def create_stock():
    try:
        stock = request.get_json(force=True)
        values = [stock['clone']['name'], format_date(stock['clone']['purify_date'])]

        clone_id = query_db("SELECT id FROM Clone WHERE name=? AND purify_date=?", args=values)[0][0]

        stock = add_stock([format_date(stock['stockDate']), clone_id, stock['stockFFU']])

        if not stock:
            return json.dumps({'success': False, 'msg': "Stock already exists"}), 404, {'ContentType': 'application/json'}

        return json.dumps({'success': True, 'msg': "Stock created successfully"}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print("Error in create_stock(): ", e)
        return json.dumps({'success': False, 'msg': e}), 404, {'ContentType': 'application/json'}


# POST request to enter a new clone and stock
@app.route('/create_clone_and_stock', methods=['POST'])
def create_clone_and_stock():
    data = request.get_json(force=True)

    clone_id = add_clone([data["cName"], data["cAA"], data["cType"], format_date(data["cDate"])])
    isolate_toggle = format_date(data["cDate"]) == datetime.date(1111, 11, 11)

    if not clone_id and not isolate_toggle:
        return json.dumps({'success': False, 'msg': "Clone already exists"}), 404, {'ContentType': 'application/json'}

    elif not clone_id and isolate_toggle:
        clone_id = query_db("SELECT id FROM Clone WHERE name=? AND purify_date=?", args=[data["cName"], format_date(data["cDate"])])[0][0]

        stock = add_stock([format_date(data['stockDate']), clone_id, data['stockFFU']])
    else:
        stock = add_stock([format_date(data['stockDate']), clone_id, data['stockFFU']])

    if not stock:
        return json.dumps({'success': False, 'msg': "Stock already exists"}), 404, {'ContentType': 'application/json'}

    if isolate_toggle:
        return json.dumps({'success': True, 'msg': "Isolate and stock created successfully"}), 200, {'ContentType': 'application/json'}
    else:
        return json.dumps({'success': True, 'msg': "Clone and stock created successfully"}), 200, {'ContentType': 'application/json'}


# POST request to enter a new drug
@app.route('/create_drug', methods=['POST'])
def create_drug():
    try:
        data = request.get_json(force=True)

        val = add_drug([data['name'], data['abbrev']])
        if not val:
            return json.dumps({'success': False, 'msg': "Drug already exists"}), 404, {'ContentType': 'application/json'}

        return json.dumps({'success': True, 'msg': "Drug created successfully"}), 200, {'ContentType': 'application/json'}

    except IndexError as e:
        return json.dumps({'success': False, 'msg': e}), 404, {'ContentType': 'application/json'}


# POST request to update clone
@app.route('/update_clone', methods=['POST'])
def udpate_clone():
    try:
        data = request.get_json(force=True)
        clone = [data["name"], data["aa_changes"], data["type"], format_date(data["purify_date"]), data["id"]]

        add_clone(clone, edit=True)
        return json.dumps({'success': True, 'msg': "Clone ID #" + str(data["id"]) + " updated."}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        return json.dumps({'success': False, 'msg': str(e)}), 404, {'ContentType': 'application/json'}


# POST request to update clone
@app.route('/update_stock', methods=['POST'])
def update_stock():
    try:
        data = request.get_json(force=True)
        stock = [format_date(data["harvest_date"]), data["clone"], data["ffu_per_ml"], data["id"]]

        add_stock(stock, edit=True)
        return json.dumps({'success': True, 'msg': "Stock ID #" + str(data["id"]) + " updated."}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        return json.dumps({'success': False, 'msg': str(e)}), 404, {'ContentType': 'application/json'}


# POST request to enter a new plate reading
@app.route('/create_plate', methods=['POST'])
def create_plate():
    data = request.get_json(force=True)

    if data:
        try:
            file = data['file'].replace('\r', '').split('\n')
            abs_by_quadrants = [[] for x in range(0, 4)]
            abs_values = [float(x.split(',')[5]) for x in file[1:] if len(x) > 0]

        except (IndexError, KeyError) as e:
            return json.dumps({'success': False, 'msg': "Invalid file submitted"}), 404, {'ContentType': 'application/json'}

        marker = 0
        for i in range(0, 4):
            abs_by_quadrants[0].append(abs_values[marker: marker + 6])
            abs_by_quadrants[1].append(abs_values[marker + 6: marker + 12])

            b_half = marker + 48
            abs_by_quadrants[2].append(abs_values[b_half: b_half + 6])
            abs_by_quadrants[3].append(abs_values[b_half + 6: b_half + 12])

            marker += 12

        quadrants = []
        quad_lbl = [str(x) for x in range(3, 7)]
        for i in range(0, 4):
            try:
                info = data['quads'][quad_lbl[i]]

                # deal with concRange
                raw_conc_range = info['concRange']
                conc_range = []
                for x in raw_conc_range:
                    conc_range.append(x['step'])

                info_picked = [info['selectedClone']['Virus_Stock_id'],
                               info['drug']['id'],
                               pickle.dumps(conc_range),
                               info['numControls'],
                               pickle.dumps(abs_by_quadrants[i])]

                q = quadrant.Quadrant(*info_picked)
                quadrants.append(info_picked)

            except TypeError as e:
                quadrants.append(None)
                print("Quadrant " + str(i) + " not appended because ", e)
            except KeyError as e:
                quadrants.append(None)
                print("Quadrant " + str(i) + " not appended because ", e)

        plate = [data['name'],
                 format_date(data['date']),
                 data['letter']]

        try:
            add_result = add_plate_and_quadrants(plate, quadrants)
            if not add_result:
                return json.dumps({'success': False,
                                   'msg': "Plate already exists"}), 404, {'ContentType': 'application/json'}

            return json.dumps({'success': True,
                               'msg': "Successful plate creation",
                               'next_url': url_for('analysis', plate_id=add_result)}), 200, {'ContentType': 'application/json'}
        except Exception as e:
            print("ERROR: ", e)
            return json.dumps({'success': False,
                               'msg': "Error creating plate: " + str(e)}), 404, {'ContentType': 'application/json'}

    else:
        return json.dumps({'success': False,
                           'msg': "Error creating plate"}), 404, {'ContentType': 'application/json'}


# GET request to get all stocks
@app.route('/get_all_stocks', methods=["GET"])
def get_all_stocks():
    resp = format_resp(query_db("SELECT * FROM Virus_Stock JOIN Clone ON Virus_Stock.clone = Clone.id"),
                       ["Virus_Stock", "Clone"], True)

    for i in range(0, len(resp)):
        resp[i]['Virus_Stock_harvest_date'] = convert_date(resp[i]['Virus_Stock_harvest_date'])
        resp[i]['Clone_purify_date'] = convert_date(resp[i]['Clone_purify_date'])

    return json.dumps(resp)


# GET request to get all clones
@app.route('/get_all_clones', methods=["GET"])
def get_all_clones():
    resp = format_resp(query_db("SELECT * FROM Clone"), ["Clone"])

    for i in range(0, len(resp)):
        resp[i]['purify_date'] = convert_date(resp[i]['purify_date'])

    return json.dumps(resp)


# GET request to get all drugs
@app.route('/get_all_drugs', methods=["GET"])
def get_all_drugs():
    resp = format_resp(query_db("SELECT * FROM Drug"), ["Drug"])

    return json.dumps(resp)


# GET request to get specific plate
@app.route('/get_plate/<int:plate_id>', methods=["GET"])
def get_plate(plate_id):
    try:
        data_raw = query_db("SELECT * FROM Plate_Reading AS a "
                            "JOIN Plate_to_Quadrant AS b ON a.id=b.plate_id "
                            "JOIN Quadrant AS c ON b.quad=c.id "
                            "JOIN Virus_Stock AS d ON c.virus_stock=d.id "
                            "JOIN Clone AS e ON d.clone=e.id "
                            "JOIN Drug As f ON c.drug=f.id WHERE a.id=?", args=[plate_id])

        if len(data_raw) == 0:
            raise IndexError()

        data_parsed = format_resp(data_raw, ['Plate_Reading', 'Plate_to_Quadrant', 'Quadrant', 'Virus_Stock', 'Clone', 'Drug'], True)

        pp.pprint(data_parsed)

        for index, q in enumerate(data_parsed):
            q_data = [q['Quadrant_virus_stock'],
                      q['Quadrant_drug'],
                      pickle.loads(q['Quadrant_concentration_range']),
                      q['Quadrant_num_controls'],
                      pickle.loads(q['Quadrant_q_abs'])]

            quad = quadrant.Quadrant(*q_data)

            q['Clone_purify_date'] = convert_date(q['Clone_purify_date'])
            q['Plate_Reading_read_date'] = convert_date(q['Plate_Reading_read_date'])
            q['Virus_Stock_harvest_date'] = convert_date(q['Virus_Stock_harvest_date'])
            q['Quadrant_q_abs'] = quad.parse_vals()
            q['Quadrant_concentration_range'] = quad.calc_c_range()
            q['regression'] = quad.sigmoidal_regression()

        # TODO fix query problems
        return json.dumps(data_parsed)

    except ValueError as e:
        return json.dumps(data_parsed)
    except IndexError as e:
        return json.dumps({'success': False, 'msg': "Plate does not exist"}), 404, {'ContentType': 'application/json'}
    except ZeroDivisionError as e:
        return json.dumps({'success': False, 'msg': "Zero division error in parsing absorbance values. Ensure correct quadrant was selected."}), 404, {'ContentType': 'application/json'}

# GET request to get specific clone
@app.route('/get_clone/<int:clone_id>', methods=["GET"])
def get_clone(clone_id):
    try:
        data_raw = query_db("SELECT * FROM Clone WHERE id=?", args=[clone_id])

        if len(data_raw) == 0:
            raise IndexError()

        data_parsed = format_resp(data_raw, ['Clone'])[0]
        data_parsed['purify_date'] = convert_date(data_parsed['purify_date'])

        return json.dumps(data_parsed)

    except ValueError as e:
        return json.dumps(data_parsed)
    except IndexError as e:
        return json.dumps({'success': False, 'msg': "Clone does not exist"}), 404, {'ContentType': 'application/json'}


# GET request to get specific stock
@app.route('/get_stock/<int:stock_id>', methods=["GET"])
def get_stock(stock_id):
    try:
        data_raw = query_db("SELECT * FROM Virus_Stock WHERE id=?", args=[stock_id])

        if len(data_raw) == 0:
            raise IndexError()

        data_parsed = format_resp(data_raw, ['Virus_Stock'])[0]
        data_parsed['harvest_date'] = convert_date(data_parsed['harvest_date'])

        return json.dumps(data_parsed)

    except ValueError as e:
        return json.dumps(data_parsed)
    except IndexError as e:
        return json.dumps({'success': False, 'msg': "Virus stock does not exist"}), 404, {'ContentType': 'application/json'}

# initializes app
if __name__ == "__main__":
    create_db()

    app.debug = True
    app.run(host="127.0.0.1", port=8080, threaded=True)
