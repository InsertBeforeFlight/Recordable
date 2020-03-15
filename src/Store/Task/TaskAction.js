import * as TaskActionTypes from "./TaskActionTypes";
import { getSavedCollection, updateSavedCollection } from "../../Helpers/storageHelper";
import { saveAudit } from "../Audit/AuditAction";

const TASK_STORAGE_IDENTIFIER = "TODOAPP_TASKS";


export const beginLoadingSavedTasks = () => ({
    type: TaskActionTypes.TASK_LOAD
})

export const completedLoadingSavedTasks = (tasks) => ({
    type: TaskActionTypes.TASK_LOAD_COMPLETE,
    payload: { tasks },
});

export const failedLoadingSavedTasks = () => ({
    type: TaskActionTypes.TASK_LOAD_FAILED
})

export const loadSavedTasks = () => dispatch => {
    dispatch(beginLoadingSavedTasks())

    try {

        const { tasks } = getSavedCollection(TASK_STORAGE_IDENTIFIER)

        if (tasks.length) {
            dispatch(completedLoadingSavedTasks(tasks));
        } else {
            dispatch(failedLoadingSavedTasks())
        }

    } catch (error) {

        updateSavedCollection(TASK_STORAGE_IDENTIFIER, { tasks: [] })
        dispatch(failedLoadingSavedTasks())

    }

}

export const prepareToAddTask = () => ({
    type: TaskActionTypes.TASK_ADD_PREPARE
})

export const unprepareToAddTask = taskId => ({
    type: TaskActionTypes.TASK_ADD_UNPREPARE,
    payload: { taskId }
})

export const completedSavingTask = task => ({
    type: TaskActionTypes.TASK_SAVE_COMPLETE,
    payload: { task }
})

export const failedSavingTask = task => ({
    type: TaskActionTypes.TASK_SAVE_FAILED,
    payload: { task }
})

const updateTaskCollection = (task, fieldName, newValue) => {
    const taskContainer = getSavedCollection(TASK_STORAGE_IDENTIFIER);
    const existingTask = taskContainer.tasks.find(({ id }) => task.id === id);

    if (!existingTask) {
        task.created = new Date().toISOString()
        task[fieldName] = newValue;
        taskContainer.tasks.push(task);
        updateSavedCollection(TASK_STORAGE_IDENTIFIER, taskContainer);
        return task;
    }

    existingTask[fieldName] = newValue;
    updateSavedCollection(TASK_STORAGE_IDENTIFIER, taskContainer);

    return existingTask;
}

export const saveTask = (task, fieldName, newValue) => dispatch => {
    try {

        const savedTask = updateTaskCollection(task, fieldName, newValue);

        dispatch(saveAudit(task, fieldName, newValue))

        dispatch(completedSavingTask(savedTask))

    } catch (error) {

        dispatch(failedSavingTask(task))

    }
}