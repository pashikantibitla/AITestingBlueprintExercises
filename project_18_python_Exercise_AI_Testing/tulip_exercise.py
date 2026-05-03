severity_levels = ("P0", "P1", "P2", "P3", "P4")
# tuple
# severity_levels[0]="P5" # NOT POSSIBLE
print(severity_levels)
print(severity_levels[0])
print(severity_levels[-1])  # "P0"

# tuple is immutable

# SET

severity_levels = ["P0", "P1", "P2", "P3", "P4", "P0", "P1", "P2", "P3", "P4"]
# Change to set
severity_levels = set(severity_levels)
print(severity_levels)

a =  {"1","2","3"}
b =set(["1","2","3"])
print(a)
print(b)
"""
Method	Description
count()	Returns the number of times a specified value occurs in a tuple
index()	Searches the tuple for a specified value and returns the position of where it was found
"""


# [] - List
# () - Tuple
# {} - Set
# {} - Dict (k, v) - Key Value Pair

