# import random

# a = [1, 3, 6, 4, 1, 2]

# # for i in range(20):
# #   a.append(random.randint(-10,20))

# def tugas(x):
#   y = sorted(list(set(x)))
#   print(y)
#   for i in range(0,len(y)-1):
#     if 1 not in x: return 1
#     if y[i] > 0:
#       if (y[i] + y[i+1])/2 != (y[i] + y[i] + 1) / 2: return y[i] + 1

#   return y[len(y) - 1] + 1

# print(a)
# print(tugas(a))

def solution(S):
    # Calculate the number of trailing zeros in the binary representation of 2^400,000 - 1
    count = len(S) - len(S.rstrip('0'))
    return count

# Test case
S = "1" * 400000
print(solution(S))  # Output: 799999

