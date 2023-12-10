import csv
import json
import itertools

prime_mapping = {
    "2": 2,
    "3": 3,
    "4": 5,
    "5": 7,
    "6": 11,
    "7": 13,
    "8": 17,
    "9": 19,
    "T": 23,
    "J": 29,
    "Q": 31,
    "K": 37,
    "A": 41,
}


# We need separate lookup tables for flushes and non-flushes
lookup_table_basic = {}
lookup_table_flushes = {}
flush_flag = False

with open("HandOrderingsCSV.csv", newline="") as csvfile:
    reader = csv.reader(csvfile, delimiter=",", quotechar="|")
    for rowI, row in enumerate(reader):
        assert len(row) == 1
        vals = row[0].split()
        # combos = vals[0]
        cards = vals[1:6]
        card_vals = [prime_mapping[x] for x in cards]
        cards_mult = (
            card_vals[0] * card_vals[1] * card_vals[2] * card_vals[3] * card_vals[4]
        )
        if len(vals) > 6:
            desc = "".join(vals[6:])
            if "flush" in desc.lower():
                flush_flag = True
            else:
                flush_flag = False
        if flush_flag:
            assert cards_mult not in lookup_table_flushes
            lookup_table_flushes[cards_mult] = rowI
        else:
            assert cards_mult not in lookup_table_basic
            lookup_table_basic[cards_mult] = rowI

# Should be 7462 unique hands
assert len(lookup_table_basic) + len(lookup_table_flushes) == 7462
# And all lookup values should be unique...
lookup_vals = list(lookup_table_basic.values()) + list(lookup_table_flushes.values()) 
lookup_vals.sort()
assert lookup_vals == list(range(7462))

# Sanity check - every combination of 5c cards should be in the lookup table
# And if all cards are unique, each one should be in the flush lookup table
primes = list(prime_mapping.values())
for p1 in primes:
    for p2 in primes:
        for p3 in primes:
            for p4 in primes:
                for p5 in primes:
                    if p1 == p2 == p3 == p4 == p5:
                        continue
                    res = p1 * p2 * p3 * p4 * p5
                    assert res in lookup_table_basic



# Sanity check two: make sure all possible 4 aces hands correspond to 19
check_cards = [37, 31, 29, 23, 19, 17, 13, 11, 7, 5, 3, 2]
lookup_val = 10
for k in check_cards:
    four_aces = 41 * 41 * 41 * 41 * k
    lookup_val_expected = lookup_val + check_cards.index(k)
    assert lookup_table_basic[four_aces] == lookup_val_expected

with open("lookup_table_basic.json", "w") as f:
    f.write(json.dumps(lookup_table_basic))

with open("lookup_table_flushes.json", "w") as f:
    f.write(json.dumps(lookup_table_flushes))
