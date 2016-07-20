#!/usr/bin/python
from __future__ import division
import math
import pprint as pp

class Quadrant(object):
	variables = 12

	def __init__(self, q_id, min_c, max_c, num_controls, log, abs_val):
		self.q_id = q_id
		self.min_c = min_c
		self.max_c = max_c
		self.num_controls = num_controls
		self.log = log
		self.abs_val = abs_val

	def showAbs(self):
		return self.abs_val

	def calc_conc_range(self):
		# todo fix range calculation
		n = int((self.variables - self.num_controls - 2) / 2)
		conc_range = [math.pow(10, x) for x in range(-1 * n, n + 1)]

		return conc_range

	def format_abs_vals(self):
		x = []
		for j in range(0, 5, 2):
			for i in range(0, len(self.abs_val)):
				x1 = self.abs_val[i][j]
				x2 = self.abs_val[i][j + 1]

				x.append([x1, x2])	

		return x

	def parse_vals(self):
		vals = self.format_abs_vals()

		no_virus_control = 0.0
		for i in range(0, self.num_controls):
			no_virus_control += vals[len(vals) - 1 - i][0] + vals[len(vals) - 1 - i][1]

		for i in range(0, self.num_controls):
			vals.pop()

		no_virus_control = float(no_virus_control / (self.num_controls * 2))

		for i in range(0, len(vals)):
			for j in range(0, 2):
				vals[i][j] = vals[i][j] - no_virus_control

		no_drug_control = float((vals[0][0] + vals[0][1]) / 2)
		vals.pop(0)

		for i in range(0, len(vals)):
			vals[i][0] = vals[i][0] / no_drug_control * 100
			vals[i][1] = vals[i][1] / no_drug_control * 100

		return vals


def file_prompt():
	error_message = "Error in processing input. Please drag and drop a csv file."

	inp = ""
	while not inp:
		try:
			inp = raw_input("Step 1: Please drag and drop plate file (csv): ")

			if inp[len(inp) - 1] == " ":
				inp = inp[0:len(inp) - 1]

			if inp[-3:] != "csv":
				print(error_message)
				inp = ""
		except:
			print(error_message)
			inp = ""

	return inp


def num_quadrant_prompt():
	error_message = "Error in processing input. Please use a number between 1 and 4, inclusive."

	inp = ""
	while not inp:
		try:
			inp = input("Step 2: How many quadrants are in use?: ")

			if not isinstance(inp, int) or inp > 4 or inp < 1:
				print(error_message)
				inp = ""

		except (NameError, SyntaxError) as e:
			print(error_message)
			inp = ""

	return inp


def num_prompt(string, quadrant):
	error_message = "Error in processing input. Please check that a number was used."

	inp = ""
	while not inp:
		try:
			inp = input(string % quadrant)

		except (NameError, SyntaxError) as e:
			print(error_message)
			inp = ""

	return inp

def int_prompt(string, quadrant):
	error_message = "Error in processing input. Please check that an integer was used."
	
	inp = ""
	while not inp:
		try:
			inp = input(string % quadrant)

			if not isinstance(inp, int):
				print(error_message)
				inp = ""			

		except (NameError, SyntaxError) as e:
			print(error_message)
			inp = ""

	return inp

def main():
	print("""
	-----
	Welcome to Assay Plate Parser (v1.0).

	For each step, please press the return (or enter key) to confirm input.

	-----""")

	file_name = file_prompt()
	num_quads = num_quadrant_prompt()

	abs_by_quadrants = [[] for x in range(0, 4)]
	with open(file_name, 'r') as file:
		data = file.read().split('\r\n')

		header = data[0]
		abs_values = [float(x.split(',')[5]) for x in data[1:]]

		marker = 0
		for i in range(0, 4):
			abs_by_quadrants[0].append(abs_values[marker : marker+6])
			abs_by_quadrants[1].append(abs_values[marker + 6: marker+12])

			b_half = marker + 48;
			abs_by_quadrants[2].append(abs_values[b_half: b_half+6])
			abs_by_quadrants[3].append(abs_values[b_half + 6: b_half+12])

			marker += 12

	quadrants = []
	for i in range(0, num_quads):
		min_c = num_prompt("Step 3 for Quadrant %s: Please input minimum concentration: ", i+1)
		max_c = num_prompt("Step 4 for Quadrant %s: Please input maximum concentration: ", i+1)


		num_controls = int_prompt("Step 5 for Quadrant %s: Please input how many rows of controls: ", i+1)

		half_log_prompt = raw_input("Step 6 for Quadrant " + str(i + 1) + ": Are you using log (input y) or half-log (input n): ")
		half_log = half_log_prompt.upper() == "Y"

		q = Quadrant(i, min_c, max_c, num_controls, half_log, abs_by_quadrants[i])
		quadrants.append(q)

		print('')

	print("--- RESULTS ---")
	for q in quadrants:
		conc = q.calc_conc_range()
		p_vals = q.parse_vals()

		print("For Quadrant " + str(q.q_id + 1))
		for i in range(0, len(conc)):
			print(str(conc[i]) + '\t' + str(p_vals[i][0]) + '\t' + str(p_vals[i][1]))

		print('')

if __name__ == "__main__":
	main()


