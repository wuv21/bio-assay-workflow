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

def main():
	print("""
	-----
	Welcome to Assay Plate Parser (v1.0).

	For each step, please press the return (or enter key) to confirm input.

	-----""")

	file_name = raw_input("Step 1: Please drag and drop plate file (csv): ")
	num_quads = input("Step 2: How many quadrants are in use?: ")


	if file_name[len(file_name) - 1] == " ":
		file_name = file_name[0:len(file_name) - 1]

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
		min_c = input("Step 3 for Quadrant " + str(i + 1) + ": Please input minimum concentration: ")
		max_c = input("Step 4 for Quadrant " + str(i + 1) + ": Please input maximum concentration: ")
		num_controls = input("Step 5 for Quadrant " + str(i + 1) + ": Please input how many rows of controls: ")

		half_log_prompt = raw_input("Step 6 for Quadrant " + str(i + 1) + ": Are you using log (input y) or half-log (input n): ")
		half_log = half_log_prompt.upper() == "Y"

		q = Quadrant(i, min_c, max_c, num_controls, half_log, abs_by_quadrants[i])
		quadrants.append(q)

		print('')

	for q in quadrants:
		conc = q.calc_conc_range()
		p_vals = q.parse_vals()

		print("For Quadrant " + str(q.q_id + 1))
		for i in range(0, len(conc)):
			print(str(conc[i]) + '\t' + str(p_vals[i][0]) + '\t' + str(p_vals[i][1]))

		print('')

if __name__ == "__main__":
	main()


