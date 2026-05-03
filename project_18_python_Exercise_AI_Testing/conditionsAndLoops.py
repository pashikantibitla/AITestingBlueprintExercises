"""
If else condition
"""
test_score = 0.73
if test_score >= 0.9:
    print("High Confidence")
elif test_score >= 0.7:
    print("Medium Confidence")
else:
    print("Low Confidence")

models = ["gpt-4", "claude-sonnet", "gemini-pro"]
test_results = ["PASS", "FAIL", "PASS", "PASS", "FAIL"]
scores = [0.9, 0.3, 0.85, 0.45, 0.72]
test_steps = ["login", "navigate", "click_button", "verify"]

# this is comment in python, this code will not be executed.
# Iterate over them

for model in models:
    print(model)

print("---------")

# range(3) -> 0,1,2
print(models[0])
print(models[1])
print(models[2])


for i in range(3):
    print(models[i])

print("---------")


for result in test_results:
    print(result)

print("---------")


for score in scores:
    print(score)

print("---------")

for step in test_steps:
    print(step)


test_results = ["PASS", "FAIL", "PASS", "PASS", "FAIL"]

fail_count = 0
for result in test_results:
    if result == "FAIL":
        fail_count += 1

print(f"Failed: {fail_count} out of {len(test_results)}")

#############################################################
"""loops using List """
models = ["gpt-4", "claude-sonnet", "gemini-pro"]
for model in models:
    print(f"Model : {model}")

# +=
# -=
# ++I - No Incremnt in Python
# --I - No Decremnt in Python
# I++ - No Incremnt in Python
# I-- - No Decremnt in Python

a = 10
a += 1 # a = a + 1
print(a)

a -= 2 # a = a - 1
print(a)

# --, ++ there is no concept in python

"""While loop """
# while loop — repeat until a condition is met

retries = 0
max_retries = 3

while retries < max_retries:
    print(f"Retry {retries + 1}...")
    retries += 1

print("Done!")
"""for - in loop"""
scores = [0.9, 0.3, 0.85, 0.45, 0.72]
passing_scores = []
for s in scores:
    if s >= 0.7:
        passing_scores.append(s)

print(passing_scores)

test_steps_1 = ["login", "navigate", "click_button", "verify"]

print(f'{test_steps_1[0]}')     # "login"
print(f'{test_steps_1[-1]}')


test_steps.append("screenshot")     # "verify" (last element)
test_steps.insert(2, "wait_for_load")
test_steps.remove("click_button")
test_steps.pop()
print(f'modified string after all functions {test_steps_1} is list')