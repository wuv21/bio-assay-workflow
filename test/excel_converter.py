import xlrd
import csv
from os import listdir, getcwd
from os.path import isfile, join

def convertToCSV(input_name):
    book = xlrd.open_workbook(input_name)
    sheet = book.sheet_by_index(0)

    csvfile = open(input_name[:-3] + 'csv', 'w')
    wr = csv.writer(csvfile)

    for rownum in range(sheet.nrows):
        wr.writerow(sheet.row_values(rownum))

    csvfile.close()

def main():
    xls_files = [f for f in listdir(getcwd()) if isfile(join(getcwd(), f)) and f.endswith('xls')]
    for x in xls_files:
        print('Converting...' + x)
        convertToCSV(x)

if __name__ == "__main__":
    main()
