# Routes Map

- Instead of...
POST /resources/:id/update

- You could use...
PUT /resources/:id


GET /todos
    - Main Page, list of all items in 4 boxes
    - Form on main page that allows users to enter items in toDoList

POST /todos
    - Does calls to each API, if any/all get a hit add to each relevant table
    - Submission of form that adds item to list

GET /todos/:id 
    - Show metadata of item on another page

GET /todos/:id/edit 
    - Brings up the edit page for an item

POST /todos/:id 
    - Edit the data of an item as the user wishes
    - No API call, the user may edit the data as they see fit

POST /todos/:id/delete 
    - Remove item from list

POST /todos/:id/:category
    - Removes an item from one list
    - API call for metadata for new list, error message if API cannot find 
    - Adds it to the list selected by the user