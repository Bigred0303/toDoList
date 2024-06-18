# Routes Map

- Instead of...
POST /resources/:id/update

- You could use...
PUT /resources/:id


GET todo/index 
    - Main Page, list of all items in 4 boxes

GET todo/new 
    - Form on main page that allows users to enter items in toDoList

POST todo/index 
    - Does calls to each API, if any/all get a hit add to each relevant table
    - Submission of form that adds item to list

GET todo/:id 
    - Show metadata of item on another page

GET todo/:id/edit 
    - Brings up the edit page for an item

POST todo/:id 
    - Edit the data of an item as the user wishes
    - No API call, the user may edit the data as they see fit

POST todo/:id/delete 
    - Remove item from list

POST todo/index 
    - Removes an item from one list
    - API call for metadata for new list, error message if API cannot find 
    - Adds it to the list selected by the user