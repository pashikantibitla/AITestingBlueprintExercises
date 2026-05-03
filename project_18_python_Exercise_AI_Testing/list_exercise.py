test_results = ["PASS", "FAIL", "PASS", "PASS", "FAIL"]
print(test_results)
print(test_results[0])
print(test_results[1])
print(test_results[2])
print(test_results[3])
print(test_results[4])
print(test_results[-1])
print(test_results[-2])
print(test_results[-3])
print(test_results[-4])
print(test_results[-5])

fruits = ["apple", "banana", "cherry"]
print(fruits)

mix_list = [1, "apple", 0.5, True, None]
print(mix_list)

print(len(test_results))
print(len(fruits))
print(len(mix_list))

# list functions

test_results.append("PASS")
print("append:" + f"{test_results}")

test_results.remove("FAIL")
print("remove" + f"{test_results}")

test_results.pop()
print("pop:", test_results)

test_results.insert(0, "FAIL")
print("insert fail:", test_results)

test_results.sort()
print("sort:", test_results)

test_results.reverse()
print("reverse", test_results)

test_results.count("PASS")
print("count:", test_results)

test_results.index("PASS")
print("index:", test_results)

test_results.copy()
print("cpy", test_results)

test_results.clear()
print("clear list:", test_results)

"""
Method	Description
append()	Adds an element at the end of the list
clear()	Removes all the elements from the list
copy()	Returns a copy of the list
count()	Returns the number of elements with the specified value
extend()	Add the elements of a list (or any iterable), to the end of the current list
index()	Returns the index of the first element with the specified value
insert()	Adds an element at the specified position
pop()	Removes the element at the specified position
remove()	Removes the item with the specified value
reverse()	Reverses the order of the list
sort()	Sorts the list
"""
