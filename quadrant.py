import math
import numpy as np
import scipy.optimize


class Quadrant(object):
    variables = 12

    def __init__(self, virus_stock, drug_id, c_range, num_ctrl, abs_val):
        self.virus_stock = virus_stock
        self.drug_id = drug_id
        self.c_range = c_range
        self.num_ctrl = num_ctrl
        self.abs_val = abs_val

        self.popt = []

    def calc_c_range(self):
        # minimum = int(round(math.log(self.min_c, 10)))
        # if self.inc == 'log10':
        #     maximum = self.variables - self.num_ctrl - 1 + minimum
        #     c_range = [math.pow(10, x) for x in range(minimum, maximum)]
        #
        #     return c_range
        # else:
        #     maximum = math.trunc((self.variables - self.num_ctrl - 1 + minimum) / 2)
        #     c_range = []
        #
        #     test = str(self.min_c)
        #     if test[len(test) - 1] == '4':
        #         for i in range(0, round((self.variables - self.num_ctrl) / 2) - 1):
        #             c_range.append(self.min_c * math.pow(10, i))
        #             c_range.append(self.min_c / 4.0 * math.pow(10, i + 1))
        #
        #     else:
        #         for i in range(minimum, maximum - 1):
        #             c_range.append(math.pow(10, i))
        #             c_range.append(4.0 * math.pow(10, i))
        #
        #     return c_range

        return self.c_range


    def format_abs_vals(self):
        x = []
        for j in range(0, 5, 2):
            for i in range(0, len(self.abs_val)):
                x1 = self.abs_val[i][j]
                x2 = self.abs_val[i][j+1]

                x.append([x1, x2])

        return x

    def parse_vals(self):
        vals = self.format_abs_vals()

        no_virus_control = 0.0
        for i in range(0, self.num_ctrl):
            no_virus_control += vals[len(vals) - 1 - i][0] + vals[len(vals) - 1 - i][1]

        for i in range(0, self.num_ctrl):
            vals.pop()

        no_virus_control = float(no_virus_control / (self.num_ctrl * 2))

        for i in range(0, len(vals)):
            for j in range(0, 2):
                difference = vals[i][j] - no_virus_control
                if difference < 0:
                    vals[i][j] = 0
                else:
                    vals[i][j] = difference

        no_drug_control = float((vals[0][0] + vals[0][1]) / 2)
        vals.pop(0)

        for i in range(0, len(vals)):
            vals[i][0] = vals[i][0] / no_drug_control * 100
            vals[i][1] = vals[i][1] / no_drug_control * 100

        return vals

    def sigmoid(self, x, top, bottom, ec):
        # todo check param ordering...
        y = bottom + ((top - bottom) / (1 + np.power(10, np.log10(ec) - x)))

        return y

    def sigmoidal_regression(self):
        values = self.parse_vals()
        y0 = [y[0] for y in values]
        y1 = [y[1] for y in values]

        conc = self.calc_c_range()

        y_mean = [np.mean([y0[i], y1[i]]) for i in range(0, len(y0))]
        x = np.array(conc + conc, dtype='float')
        y = np.array(y0 + y1, dtype='float')

        popt, pcov = scipy.optimize.curve_fit(self.sigmoid, np.log10(x), y)

        self.popt = popt.tolist()
        return popt.tolist()

    def calc_r_sq(self):
        values = self.parse_vals()
        y0 = [y[0] for y in values]
        y1 = [y[1] for y in values]
        y_act = np.array(y0 + y1, dtype='float')

        conc = self.calc_c_range()
        conc = np.array(conc + conc, dtype='float')

        y_pre = self.sigmoid(np.log10(conc), *self.popt)
        y_mean = np.mean(y_act)

        ssr = np.sum(np.power(y_pre - y_mean, 2))
        sse = np.sum(np.power(y_act - y_pre, 2))
        ssto = np.sum(np.power(y_act - y_mean, 2))

        # print(values)
        # print(y_pre)
        # print(conc)
        # print(y_act)
        # print([ssr, sse, ssto])
        # print(ssr/ssto)

        return ssr/ssto
