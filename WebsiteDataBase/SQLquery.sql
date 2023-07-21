#TRUNCATE TABLE test_table;
#delete from test_table where USERNAME!='ClastronTest';

#INSERT INTO test_table(id, USERNAME, email, password) VALUES (0, 'testUser2', 'test2@email.domain', 'testPassword2');

SELECT * FROM test_schema.test_table; #WHERE USERNAME= 'testUser'and password= 'testPassword';

