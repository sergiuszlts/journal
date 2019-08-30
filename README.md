# Journal

The app includes a system for logging in, registering a new account and adding entries.
The application was created using node.js (express.js framework) and is integrated with MongoDB database.

-----------
Database structure:
---------
Structure of **journalusers**:
* **_id** - standard id (unused in the project)
* **username**
* **password** - encrypted password
* **email** - unique email
* **id** - unique id used to distinguish users

Structure of **journal**:
* **_id** - standard id (unused in the project)
* **userId** - entry author id
* **time** - date of writing entry
* **text**
* **id** - id used to distinguish entries

Additional collection **counters** which contains the next free id. Used records:  
Journal entries: `{ "_id" : "journalid", "sequence_value" : 0 }`  
User accounts: `{ "_id" : "journaluserid", "sequence_value" : 0 }`  