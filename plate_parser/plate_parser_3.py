#!/usr/bin/python
from __future__ import division
import math
import pprint as pp
import sys

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class Quadrant(object):
	variables = 12

	def __init__(self, q_id, min_c, num_controls, log, abs_val):
		self.q_id = q_id
		self.min_c = min_c
		self.num_controls = num_controls
		self.log = log
		self.abs_val = abs_val

	def showAbs(self):
		return self.abs_val

	def calc_conc_range(self):
		minimum = int(round(math.log(self.min_c, 10)))
		maximum = self.variables - self.num_controls - 1 + minimum

		conc_range = [math.pow(10, x) for x in range(minimum, maximum)]

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


# module functions
def file_prompt():
	error_message = "Error in processing input. Please drag and drop a csv file.\n"

	inp = ""
	while not inp:
		try:
			inp = input("Step 1: Please drag and drop plate file (CSV file only). For this step only, type 'quit' to exit program: ")

			if inp == "quit":
				sys.exit("Good bye")

			elif inp == "":
				print(error_message)

			elif inp[len(inp) - 1] == " ":
				inp = inp[0:len(inp) - 1]

			if inp[-3:] != "csv":
				print(error_message)
				inp = ""

		except (SyntaxError) as e:
			print(error_message)
			inp = ""

	return inp


def num_quadrant_prompt():
	error_message = "Error in processing input. Please use a number between 1 and 4, inclusive.\n"

	inp = ""
	while not inp:
		try:
			inp = int(input("Step 2: How many quadrants are in use?: "))

			if inp > 4 or inp < 1:
				print(error_message)
				inp = ""

		except (NameError, SyntaxError, ValueError) as e:
			print(error_message)
			inp = ""

	return inp


def num_prompt(string, quadrant):
	error_message = "Error in processing input. Please check that a number was used.\n"

	inp = ""
	while not inp:
		try:
			inp = float(input(string % quadrant))

		except (NameError, SyntaxError, ValueError) as e:
			print(error_message)
			inp = ""

	return inp


def int_prompt(string, quadrant):
	error_message = "Error in processing input. Please check that an integer was used.\n"
	
	inp = ""
	while not inp:
		try:
			inp = int(input(string % quadrant))

		except (NameError, SyntaxError, ValueError) as e:
			print(error_message)
			inp = ""

	return inp

def main():
	print(bcolors.HEADER + """
	

	Welcome to Assay Plate Parser (v1.0).

	- For each step, please press the return (or enter key) to confirm input.
	- To exit the program, press ctrl-c.
	- Current version supports 96 well plate design with drug sensitivity assay.
	- Quadrant layout for a 96 well plate is as follows:
				---------
				| 1 | 2 |
				|-------|
				| 3 | 4 |
				---------
	

	""" + bcolors.ENDC)

	file_name = file_prompt()
	num_quads = num_quadrant_prompt()

	abs_by_quadrants = [[] for x in range(0, 4)]
	with open(file_name, 'r') as file:
		data = file.read().split('\n')

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
	count = 0
	while count < num_quads:
		try:
			min_c = num_prompt("Step 3 for Quadrant %s: Please input minimum concentration: ", count+1)
			num_controls = int_prompt("Step 4 for Quadrant %s: Please input how many rows of controls: ", count+1)
			half_log_prompt = input("Step 5 for Quadrant " + str(count + 1) + ": Are you using log (input y) or half-log (input n): ")

			half_log = half_log_prompt.upper() == "Y"

			q = Quadrant(count, min_c, num_controls, half_log, abs_by_quadrants[count])
			conc = q.calc_conc_range()
			p_vals = q.parse_vals()

			quadrants.append(q)

			count += 1

		except IndexError as e:
			print("Warning: discrepancy between the minimum concentration and rows of controls. Please input information again for this quadrant.\n")

	print("\n--- RESULTS ---")
	for q in quadrants:
		print("For Quadrant " + str(q.q_id + 1))
		for i in range(0, len(conc)):
			print(str(conc[i]) + '\t' + str(p_vals[i][0]) + '\t' + str(p_vals[i][1]))

		print('')

	input('\nPress enter to quit: ')
	sys.exit(0)

if __name__ == "__main__":
	main()
