from flask import Flask, render_template, g, request, redirect, url_for
import sqlite3
import os

app = Flask(__name__)
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


def insert_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(query, args)
    conn.commit()


@app.route('/clear_db', methods=["POST"])
def clear_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM Clone")
    conn.commit()

    return redirect(url_for('index'))


@app.route('/')
def index():
    test = query_db("SELECT * FROM Clone")
    print(test)
    return render_template('index.html', r=query_db("SELECT * FROM Clone"))


@app.route('/add_clone', methods=["POST"])
def add_clone():
    clone = (request.form.get('clone_name'),
             request.form.get('clone_aa'),
             request.form.get('clone_date'))

    insert_db("INSERT INTO Clone(name, aa_changes, purify_date) VALUES(?, ?, ?)", args=clone)

    return redirect(url_for('index'))


if __name__ == "__main__":
    create_db()
    app.debug = True
    app.run()

