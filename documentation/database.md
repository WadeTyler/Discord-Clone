# Database Documentation

## MySQL Database Name
discord

## MySQL Dev Users
username: jimmy
password: ****

## Tables

#### users
+----------+--------------+------+-----+---------+-------+
| Field    | Type         | Null | Key | Default | Extra |
+----------+--------------+------+-----+---------+-------+
| userID   | varchar(512) | NO   | PRI | NULL    |       |
| username | varchar(30)  | NO   |     | NULL    |       |
| email    | varchar(50)  | NO   |     | NULL    |       |
| password | varchar(200) | NO   |     | NULL    |       |
| tag      | varchar(4)   | NO   |     | NULL    |       |
+----------+--------------+------+-----+---------+-------+

