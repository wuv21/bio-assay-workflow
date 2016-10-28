import os
import bars
import unittest
import tempfile
import ast

class BARSTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, bars.app.config['DATABASE'] = tempfile.mkstemp()
        bars.app.config['TESTING'] = True
        self.app = bars.app.test_client()
        
        with bars.app.app_context():
            bars.create_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(bars.app.config['DATABASE'])

    def test_working_pages(self):
        pages = ['', 'manage', 'edit', 'overview', 'analysis']

        for p in pages:
            rv = self.app.get('/' + p)
            assert '200 OK' == rv.status

    def test_empty_db(self):
        rv = self.app.get('/get_all_clones')

        assert '200 OK' == rv.status
        assert b'[]' == rv.data

    def test_add_clone(self):
        clone_data = ["TestClone", "WT", "pROD9", bars.format_date('12/03/2016')]

        with bars.app.app_context():
            bars.add_clone(clone_data)

        rv = self.app.get('/get_all_clones')
        result = ast.literal_eval(rv.data.decode())

        assert result[0]['name'] == "TestClone"
        assert result[0]['id'] == 1
        assert len(result) == 1

    def test_add_stock(self):
        clone_data = ["TestClone", "WT", "pROD9", bars.format_date('12/03/2016')]
        stock_data = [bars.format_date('12/14/2016'), 1, 50000]

        with bars.app.app_context() as c:
            bars.add_clone(clone_data)
            bars.add_stock(stock_data)

        rv = self.app.get('/get_all_stocks')
        result = ast.literal_eval(rv.data.decode())

        assert result[0]['Clone_name'] == clone_data[0]
        assert result[0]['Clone_id'] == stock_data[1]
        assert result[0]['Virus_Stock_id'] == 1
        assert result[0]['Virus_Stock_ffu_per_ml'] == stock_data[2]
        assert len(result) == 1

if __name__ == '__main__':
    unittest.main()
