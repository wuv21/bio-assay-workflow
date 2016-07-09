from flask import Flask, render_template, g, request, redirect, url_for, abort
import sqlite3
import os
import json
import pprint
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
    insert_db("INSERT INTO Clone(name, aa_changes, type, purify_date) VALUES(?, ?, ?, ?)", args=args)

    return query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)


# adds a virus stock into the Virus stock, given arguments
def add_stock(args):
    insert_db("INSERT INTO Virus_Stock(harvest_date, clone, ffu_per_ml) VALUES(?, ?, ?)", args=args)

    return "success"


# clears the database - USE FOR DEBUGGING ONLY
# todo remove this to prevent accidental deletion
@app.route('/clear_db', methods=["GET"])
def clear_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM Clone")
    conn.commit()

    return redirect(url_for('index'))


# index.html
@app.route('/')
def index():
    return render_template('index.html')


# edit.html
# todo decomission this endpoint
@app.route('/edit')
def edit():
    return render_template('edit.html', c=query_db("SELECT * FROM Clone"))


# enter_assay.html
# form to enter 96 well assay results
@app.route('/enter_assay')
def enter_assay():
    return render_template('enter_assay.html')


# POST request to enter a new stock
@app.route('/create_stock', methods=['POST'])
def create_stock():
    stock = request.get_json(force=True)
    values = [stock['clone']['name'], stock['clone']['purify_date']]

    clone_id = query_db("SELECT id FROM Clone WHERE name=? AND purify_date=?", args=values)[0][0]
    add_stock([stock['stockDate'], clone_id, stock['stockFFU']])

    # todo error handling

    return "success"


# POST request to enter a new clone and stock
@app.route('/create_clone_and_stock', methods=['POST'])
def create_clone_and_stock():
    data = request.get_json(force=True)

    clone_id = add_clone([data["cName"], data["cAA"], data["cType"], format_date(data["cDate"])])
    print(clone_id)
    add_stock([format_date(data['stockDate']), clone_id, data['stockFFU']])

    # todo error handling
    return "success"


# test GET request - USE FOR DEBUGGING ONLY
@app.route('/testGet', methods=['GET'])
def testGet():
    return str(query_db("SELECT * FROM Clone"))


def convert_date(date):
    d = date.split('-')
    return d[1] + '/' + d[2] + '/' + d[0]


# test POST request - USE FOR DEBUGGING ONLY
@app.route('/testPost', methods=['POST'])
def testPost():
    data = request.get_json(force=True)

    if data:
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

# initializes app
if __name__ == "__main__":
    create_db()

    app.debug = True
    app.run(host="127.0.0.1", port=8080, threaded=True)

