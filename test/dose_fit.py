import numpy as np
import matplotlib.pyplot as plt
import scipy.optimize

def sigmoid(x, top, bottom, ec):
	# todo check param ordering...
    y = bottom + ((top - bottom) / (1 + np.power(10, np.log10(ec) - x)))
    return y

# WT NL4-3
y0 = [116.136,106.434,124.895,110.316,94.625,49.778,4.917,9.014,6.047,5.956]
y1 = [133.274,122.674,102.343,142.231,128.382,50.975,6.529,11.635,6.225,6.919]

# Q148K NL4-3
# y0 = [109.557,119.052,127.558,105.863,144.836,151.813,136.279,52.524,52.956,59.969]
# y1 = [123.404,143.482,133.269,121.914,137.197,167.418,129.478,53.896,46.329,56.327]

# G140S+Q148K NL4-3
# y0 = [113.276,116.206,105.995,100.039,120.767,90.432,38.692,15.200,14.917,14.326]
# y1 = [111.374,97.497,89.020,92.216,103.095,90.920,29.931,13.903,18.181,12.743]

y_mean = [np.mean([y0[i], y1[i]]) for i in range(0, len(y0))]
conc = [0.0001,0.001,0.01,0.1,1.0,10.0,100.0,1000.0,10000.0,100000.0]

# raw data
x = np.array(conc + conc, dtype='float')
y = np.array(y0 + y1, dtype='float')

# log the x values to run regression
popt, pcov = scipy.optimize.curve_fit(sigmoid, np.log10(x), y)

print(popt)

x_curve = np.linspace(0.0001, 100000, 1000000)
y_curve = sigmoid(np.log10(x_curve), *popt)

# # Plot the results
plt.plot(conc, y_mean, '.', x_curve, y_curve, '-')
plt.xlabel('[RAL] (nM)')
plt.ylabel('Percent of no-drug control')
plt.xscale('log')
plt.grid(True)
plt.show()



