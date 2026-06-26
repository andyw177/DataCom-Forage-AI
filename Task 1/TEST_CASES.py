import unittest
import logging
from process_data import DataProcessor


class BadDict(dict):
    def keys(self):
        raise AttributeError("'dict' object has no attribute 'keys'")


class ExportCustomerDataBugTest(unittest.TestCase):
    def test_export_customer_data_logs_dict_keys_error(self):
        processor = DataProcessor("customers.csv")
        processor.customers = {
            "1": BadDict(
                name="Alice",
                email="alice@example.com",
                join_date="2020-01-01",
                total_spent=0.0,
                transaction_count=0,
            )
        }

        with self.assertLogs("process_data", level="ERROR") as cm:
            result = processor.export_customer_data("customers_export.csv", "csv")

        self.assertFalse(result)
        self.assertTrue(
            any("'dict' object has no attribute 'keys'" in message for message in cm.output),
            "Expected export_customer_data to log the dict keys error",
        )


if __name__ == "__main__":
    unittest.main()
