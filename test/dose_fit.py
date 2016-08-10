import numpy as np
import matplotlib.pyplot as plt
import scipy.optimize

def sigmoid(x, top, bottom, ec):
    y = bottom + ((top - bottom) / (1 + np.power(10, np.log10(ec) - x)))
    return y

def residuals(p,x,y):
    return y - sigmoid(p,x)

def resize(arr,lower=0.0,upper=1.0):
    arr=arr.copy()
    if lower>upper: lower,upper=upper,lower
    arr -= arr.min()
    arr *= (upper-lower)/arr.max()
    arr += lower
    return arr


raw_val = [116.136,106.434,124.895,110.316,94.625,49.778,4.917,9.014,6.047,5.956,
133.274,122.674,102.343,142.231,128.382,50.975,6.529,11.635,6.225,6.919]
log_val = [np.log10(x) for x in raw_val]

conc = [0.0001,0.001,0.01,0.1,1.0,10.0,100.0,1000.0,10000.0,100000.0]
full_conc = conc + conc

print(full_conc)

# raw data
x = np.array(full_conc,dtype='float')
y = np.array(raw_val,dtype='float')

# x=resize(-x,lower=0.3)
# y=resize(y,lower=0.3)
popt, pcov = scipy.optimize.curve_fit(sigmoid, x, y)

print(popt)
xp = np.linspace(0.00001, 100000, 1000000)
pxp=sigmoid(xp,*popt)

# # Plot the results
plt.plot(x, y, '.', xp, pxp, '-')
plt.xlabel('x')
plt.ylabel('y',rotation='horizontal')
plt.xscale('log')
plt.grid(True)
plt.show()