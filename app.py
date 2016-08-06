from flask import Flask, render_template, g, request, redirect, url_for, abort
import sqlite3
import os
import json
import datetime
# from flask_cors import CORS

from werkzeug.exceptions import BadRequest


app = Flask(__name__)

# USE FOR DEBUGGING ONLY
import pprint
pp = pprint.PrettyPrinter(indent=4)

# constants
DATABASE = os.path.join(os.path.curdir, 'sql', 'hiv2_drug_assay.db')


# creates database
def create_db():
    with open(os.path.join(os.path.curdir, 'sql', 'create_tables.sql'), 'r') as file:
        queries = file.read()

        conn = sqlite3.connect(DATABASE)
        cur = conn.cursor()

        cur.executescript(queries)
        conn.commit()
        cur.close()
        conn.close()


# gets database from flask settings
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)

    return db


# executes query in database, accepts arguments to protect against SQL injection
# 'one' param return first result, which by default is turned off
def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)

    rv = cur.fetchall()
    cur.close()

    return (rv[0] if rv else None) if one else rv


def format_date(date_str):
    # provided param is in MM/DD/YYYY. Correct format will be in datetime.date(YYYY, MM, DD)
    date_sep = date_str.split('/')

    month = int(date_sep[0])
    day = int(date_sep[1])
    year = int(date_sep[2])

    return datetime.date(year, month, day)


# formats the query response into an array of dict in order to align with JSON formatting
def format_resp(resp, tbl_name):
    fields = []
    for name in tbl_name:
        field = query_db("PRAGMA table_info(" + name + ")")
        for x in field:
            fields.append(x[1])

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


# adds a clone into the Clone table, given arguments
def add_clone(args):
    try:
        check = query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)
        if len(check) > 0:
            return False

        insert_db("INSERT INTO Clone(name, aa_changes, type, purify_date) VALUES(?, ?, ?, ?)", args=args)

        return query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)[0][0]

    except:
        raise BadRequest("OH NO...I'm in add_clone")


# adds a virus stock into the Virus stock, given arguments
def add_stock(args):
    try:
        check = query_db("SELECT id FROM Virus_Stock WHERE harvest_date=? AND clone=? AND ffu_per_ml=?", args=args)
        if len(check) > 0:
            return False

        insert_db("INSERT INTO Virus_Stock(harvest_date, clone, ffu_per_ml) VALUES(?, ?, ?)", args=args)

        return "success"

    except:
        raise BadRequest("OH NO")


def add_drug(args):
    try:
        check = query_db("SELECT id FROM Drug WHERE name=? AND abbreviation=?", args=args)
        if len(check) > 0:
            return False

        insert_db("INSERT INTO Drug(name, abbreviation) VALUES(?, ?)", args=args)

        return "success"

    except:
        raise BadRequest("OH NO")


def convert_date(date):
    d = date.split('-')
    return d[1] + '/' + d[2] + '/' + d[0]


# index.html
@app.route('/')
def index():
    return render_template('index.html')


# manage.html
# edits virus stocks
@app.route('/manage')
def edit():
    return render_template('manage.html')


# enter_assay.html
# form to enter 96 well assay results
@app.route('/enter_assay')
def enter_assay():
    return render_template('enter_assay.html')


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

        return json.dumps({'success': True, 'msg': "Stock created successfully"}), 404, {'ContentType': 'application/json'}

    except Exception as e:
        print(e)
        return json.dumps({'success': False, 'msg': e}), 404, {'ContentType': 'application/json'}


# POST request to enter a new clone and stock
@app.route('/create_clone_and_stock', methods=['POST'])
def create_clone_and_stock():
    data = request.get_json(force=True)

    clone_id = add_clone([data["cName"], data["cAA"], data["cType"], format_date(data["cDate"])])
    if not clone_id:
        return json.dumps({'success': False, 'msg': "Clone already exists"}), 404, {'ContentType': 'application/json'}

    stock = add_stock([format_date(data['stockDate']), clone_id, data['stockFFU']])
    if not stock:
        return json.dumps({'success': False, 'msg': "Stock already exists"}), 404, {'ContentType': 'application/json'}

    return json.dumps({'success': True, 'msg': "Clone and stock created successfully"}), 200, {'ContentType': 'application/json'}


# POST request to enter a new durg
@app.route('/create_drug', methods=['POST'])
def create_drug():
    try:
        data = request.get_json(force=True)

        val = add_drug([data['name'], data['abbrev']])
        if not val:
            return json.dumps({'success': False, 'msg': "Drug already exists"}), 404, {'ContentType': 'application/json'}

        return "Drug created successfully"

    except IndexError as e:
        return json.dumps({'success': False, 'msg': e}), 404, {'ContentType': 'application/json'}


# test POST request - USE FOR DEBUGGING ONLY
@app.route('/testPost', methods=['POST'])
def testPost():
    data = request.get_json(force=True)

    if data:
        file = data['file'].replace('\r\n', '\n').split('\n')
        header = file[0]

        # todo parse file
        # q1 is A01 to D06...0:6, 12:18
        # q2 is A07 to D12
        # q3 is E01 to H06
        # q4 is E07 to H12

        abs_values = [float(x.split(',')[5]) for x in file[1:]]

        quadrants = [[] for x in range(0, 4)]
        marker = 0
        for i in range(0, 4):
            quadrants[0].append(abs_values[marker : marker+6])
            quadrants[1].append(abs_values[marker + 6: marker+12])

            b_half = marker + 48
            quadrants[2].append(abs_values[b_half: b_half+6])
            quadrants[3].append(abs_values[b_half + 6: b_half+12])

            marker += 12

        pp.pprint(quadrants)

        return "success"
    else:
        raise BadRequest("OH NO")


# GET request to get all stocks
@app.route('/get_all_stocks', methods=["GET"])
def get_all_stocks():
    resp = format_resp(query_db("SELECT * FROM Virus_Stock JOIN Clone ON Virus_Stock.clone = Clone.id"),
                       ["Virus_Stock", "Clone"])

    for i in range(0, len(resp)):
        resp[i]['harvest_date'] = convert_date(resp[i]['harvest_date'])
        resp[i]['purify_date'] = convert_date(resp[i]['purify_date'])

    return json.dumps(resp)


# GET request to get all clones
@app.route('/get_all_clones', methods=["GET"])
def get_all_clones():
    resp = format_resp(query_db("SELECT * FROM Clone"), ["Clone"])

    for i in range(0, len(resp)):
        resp[i]['purify_date'] = convert_date(resp[i]['purify_date'])

    return json.dumps(resp)


@app.route('/get_all_drugs', methods=["GET"])
def get_all_drugs():
    resp = format_resp(query_db("SELECT * FROM Drug"), ["Drug"])

    return json.dumps(resp)

# initializes app
if __name__ == "__main__":
    create_db()

    app.debug = True
    app.run(host="127.0.0.1", port=8080, threaded=True)
