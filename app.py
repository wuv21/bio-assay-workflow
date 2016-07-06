from flask import Flask, render_template, g, request, redirect, url_for
import sqlite3
import os
import json
import pprint
# from flask_cors import CORS

app = Flask(__name__)
pp = pprint.PrettyPrinter(indent=4)
# CORS(app)

DATABASE = os.path.join(os.path.curdir, 'sql', 'hiv2_drug_assay.db')


def create_db():
    with open(os.path.join(os.path.curdir, 'sql', 'create_tables.sql'), 'r') as file:
        queries = file.read()

        conn = sqlite3.connect(DATABASE)
        cur = conn.cursor()

        cur.executescript(queries)
        conn.commit()
        cur.close()
        conn.close()


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)

    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)

    rv = cur.fetchall()
    cur.close()

    return (rv[0] if rv else None) if one else rv


def format_resp(resp, tbl_name):
    fields = []
    for name in tbl_name:
        for x in query_db("PRAGMA table_info(" + name + ")"):
            fields.append(x[1])

    formatted_resp = []
    for x in resp:
        obj = {fields[i]: val for (i, val) in enumerate(x)}
        formatted_resp.append(obj)

    return formatted_resp


def insert_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(query, args)
    conn.commit()


@app.route('/clear_db', methods=["GET"])
def clear_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM Clone")
    conn.commit()

    return redirect(url_for('index'))


@app.route('/')
def index():
    return render_template('index.html')


def add_clone(args):
    insert_db("INSERT INTO Clone(name, aa_changes, type, purify_date) VALUES(?, ?, ?, ?)", args=args)

    return query_db("SELECT id FROM Clone WHERE name=? AND aa_changes=? AND type=? AND purify_date=?", args=args)


def add_stock(args):
    insert_db("INSERT INTO Virus_Stock(harvest_date, clone, ffu_per_ml) VALUES(?, ?, ?)", args=args)

    return "success"


@app.route('/edit')
def edit():
    return render_template('edit.html', c=query_db("SELECT * FROM Clone"))


@app.route('/enter_assay')
def enter_assay():
    return render_template('enter_assay.html')


@app.route('/create_stock', methods=['POST'])
def create_stock():
    stock = request.get_json(force=True)
    clone_id = query_db("SELECT id FROM Clone WHERE name=? AND purify_date=?", args=[stock['clone']['name'], stock['clone']['purify_date']])[0][0]

    add_stock([stock['stockDate'], clone_id, stock['stockFFU']])

    return "success"


@app.route('/create_clone_and_stock', methods=['POST'])
def create_clone_and_stock():
    data = request.get_json(force=True)

    clone_id = add_clone([data["cName"], data["cAA"], data["cType"], data["cDate"]])
    add_stock([data['stockDate'], clone_id, data['stockFFU']])

    return "Successful"


@app.route('/test', methods=['GET'])
def test():
    return str(query_db("SELECT * FROM Clone"))


@app.route('/get_all_stocks', methods=["GET"])
def get_all_stocks(date=''):
    if date == '':
        return json.dumps(format_resp(query_db("SELECT * FROM Virus_Stock JOIN Clone ON Virus_Stock.clone = Clone.id"),
                                      ["Virus_Stock", "Clone"]))

    return json.dumps(format_resp(query_db("SELECT * FROM Clone WHERE DATE >= ?", args=[date]),
                                  ["Virus_Stock", "Clone"]))


@app.route('/get_all_clones', methods=["GET"])
def get_all_clones():
    return json.dumps(format_resp(query_db("SELECT * FROM Clone"), ["Clone"]))

if __name__ == "__main__":
    create_db()

    app.debug = True
    app.run(host="127.0.0.1", port=8080, threaded=True)

