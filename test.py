import os
import bars
import unittest
import tempfile

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

    def test_working_index(self):
        rv = self.app.get('/')
        assert '200 OK' == rv.status

    def test_empty_db(self):
        rv = self.app.get('/get_all_clones')

        assert '200 OK' == rv.status
        assert b'[]' == rv.data

if __name__ == '__main__':
    unittest.main()
