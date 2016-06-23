from flask import Flask, render_template, g
import os
import sqlite3

app = Flask(__name__)
DATABASE = 'sql/hiv2_drug_assay.db'

def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = sqlite3.connect(DATABASE)

	return db

def query_db(query, args=(), one=False):
	cur = get_db().execute(query, args)
	rv = cur.fetchAll()
	cur.close()

	return (rv[0] if rv else None) if one else rv


@app.route('/')
def index():
	return render_template('index.html')


if __name__ == "__main__":
	app.debug = True
	app.run()