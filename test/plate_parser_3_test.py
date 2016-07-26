#!/usr/bin/python
import pytest

# import plateParse_3

class TestInputs:
	def test_input(self, monkeypatch):
		monkeypatch.setitem(__builtins__, 'input', lambda x: "test")

		i = input('insert stuff: ')

		assert i == "test"

	def test_other(self):
		assert 3 == 3

