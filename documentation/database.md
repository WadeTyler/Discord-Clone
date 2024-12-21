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
| status   | varchar(50)  | YES  |     | Offline |       |
+----------+--------------+------+-----+---------+-------+


#### servers
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| serverID    | varchar(512) | NO   | PRI | NULL    |       |
| serverName  | varchar(50)  | NO   |     | NULL    |       |
| serverOwner | varchar(512) | NO   | MUL | NULL    |       |
| serverIcon  | varchar(50)  | YES  |     | NULL    |       |
+-------------+--------------+------+-----+---------+-------+

#### channels
+--------------------+---------------+------+-----+---------+-------+
| Field              | Type          | Null | Key | Default | Extra |
+--------------------+---------------+------+-----+---------+-------+
| channelID          | varchar(512)  | NO   | PRI | NULL    |       |
| channelName        | varchar(50)   | NO   |     | NULL    |       |
| serverID           | varchar(512)  | NO   | MUL | NULL    |       |
| channelDescription | varchar(1024) | YES  |     | NULL    |       |
| channelOrder       | int           | NO   |     | NULL    |       |
| type               | varchar(10)   | NO   |     | NULL    |       |
+--------------------+---------------+------+-----+---------+-------+

#### messages
+-----------+--------------+------+-----+-------------------+-------------------+
| Field     | Type         | Null | Key | Default           | Extra             |
+-----------+--------------+------+-----+-------------------+-------------------+
| messageID | bigint       | NO   | PRI | NULL              | auto_increment    |
| senderID  | varchar(512) | NO   | MUL | NULL              |                   |
| timestamp | timestamp    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| channelID | varchar(512) | NO   | MUL | NULL              |                   |
| content   | text         | YES  |     | NULL              |                   |
+-----------+--------------+------+-----+-------------------+-------------------+

#### server_joins
+----------+--------------+------+-----+---------+-------+
| Field    | Type         | Null | Key | Default | Extra |
+----------+--------------+------+-----+---------+-------+
| serverID | varchar(512) | NO   | MUL | NULL    |       |
| userID   | varchar(512) | NO   | MUL | NULL    |       |
+----------+--------------+------+-----+---------+-------+


#### direct_messages
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| directMessageID | bigint       | NO   | PRI | NULL    | auto_increment |
| senderID        | varchar(512) | NO   |     | NULL    |                |
| receiverID      | varchar(512) | NO   |     | NULL    |                |
| timestamp       | timestamp    | NO   |     | NULL    |                |
| content         | text         | NO   |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+

#### friends
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | bigint       | NO   | PRI | NULL    | auto_increment |
| friend1  | varchar(512) | NO   | MUL | NULL    |                |
| friend2  | varchar(512) | NO   | MUL | NULL    |                |
| accepted | tinyint      | YES  |     | 0       |                |
+----------+--------------+------+-----+---------+----------------+