def generate_array(start, end):
    array = [10 ** (i+start) for i in range(end-start)]
    return array

# Example usage:
result_array = generate_array(-10, 10)
print(result_array)