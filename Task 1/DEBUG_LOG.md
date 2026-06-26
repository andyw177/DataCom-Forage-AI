The failure is most likely in DataProcessor.export_customer_data() when it tries to export customer data.

Step-by-step reasoning
The error log says:

ERROR - Error exporting data: 'dict' object has no attribute 'keys'
This comes from the generic exception handler inside export_customer_data().
In the function, the suspicious code is:

fieldnames = ["customer_id"] + list(next(iter(self.customers.values())).keys())
writer = csv.DictWriter(file, fieldnames=fieldnames)
That line is only executed in the format == "csv" branch:

It assumes each value in self.customers is a dictionary with a .keys() method.
The log shows:

Exported customer data to customers_export.csv
then immediately the error.
That means the first CSV export succeeded, and the failure happened on the second export call: export_customer_data("customers_export.json", "json").
The only way the JSON export call could produce that exact error is if:

the wrong branch was entered, or
self.customers contained an unexpected structure that made the code behave incorrectly.
Most likely root cause
The code is depending on self.customers values being simple dicts, but the export path is encountering a value or branch where that assumption is invalid. In practice, the likely root cause is:

export_customer_data() is trying to treat a dict-like object as if it were a CSV-row mapping in a way that does not match the actual data structure, specifically at:
next(iter(self.customers.values())).keys()
Why this is the strongest clue
A built-in Python dict does have .keys(), so the error suggests the code is not seeing the structure it expects.
The generic exception handler hides the exact failure location, but the log message and the code show the failure is tied to export_customer_data() and its fieldname construction.
Practical conclusion
The likely failure is caused by incorrect assumptions inside export_customer_data() about the shape of self.customers and/or the export branch being selected. The faulty line is the fieldname extraction line in the CSV branch, even though the log appears during the JSON export stage.


After looking at the response i do see that the assumption of the type is a python dictionary which should be able to call keys. Explicit type casting maye be needed if the type is no a dictionary even if its object shape may look like one. "The likely failure is caused by incorrect assumptions inside export_customer_data() about the shape of self.customers and/or the export branch being selected. The faulty line is the fieldname extraction line in the CSV branch, even though the log appears during the JSON export stage." is most insightful area of the ai response. 

What changed
In DataProcessor.export_customer_data():
Replaced next(iter(self.customers.values())).keys() with safer fieldname extraction using list(first_customer).
Avoided calling .keys() on dict-like objects that may override or break that method.
Updated row construction to use row.update(data if isinstance(data, dict) else dict(data)), which is more direct and robust.