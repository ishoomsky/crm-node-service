enum SocketEvents {
    BoardsJoin = 'boards:join',
    BoardsLeave = 'boards:leave',
    BoardsUpdate = 'boards:update',
    BoardsUpdateSuccess = 'boards: updateSuccess',
    BoardsUpdateFailure = 'boards: updateFailure',
    ColumnsCreate = 'columns:create',
    ColumnsCreateSuccess = 'columns:createSuccess',
    ColumnsCreateFailure = 'columns:createFailure',
    TasksCreate = 'tasks:create',
    TasksCreateSuccess = 'tasks:createSuccess',
    TasksCreateFailure = 'tasks:createFailure',
}
export default SocketEvents;
