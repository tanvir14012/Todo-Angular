import { ConfirmationDialogComponent } from './../confirmation-dialog/confirmation-dialog.component';
import { TodoService } from './todo-service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Todo } from './todo-types';
import { take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit, OnDestroy {
  @ViewChild('todoNgForm') todoNgForm: NgForm;
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  @ViewChild(MatTable) table: MatTable<any>;

  private _lifeCycleEnd$: Subject<any> = new Subject<any>();
  todoForm: FormGroup;
  todoList: Todo[] = [];
  createMode: boolean = false;
  editMode: boolean = false;
  alert: {
    type: string,
    msg: string
  } | null = null;
  columnsToDisplay = ['todo', 'action'];

  //Set min date and max date for the datepicker, values are today and six months from today.
  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().setMonth(this.minDate.getMonth()+6));

  constructor(
    private _fb: FormBuilder,
    private _todoService: TodoService,
    private _dialog: MatDialog
  ) { }



  ngOnInit(): void {
    /**
     * Initialize the todo form
     */
    this.todoForm = this._fb.group({
      id: [0],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      status: ['', [Validators.required]],
      date: ['']
    });

    /**
     * Subscribe to todo list changes
     */
    this._todoService.todoList.pipe(
      takeUntil(this._lifeCycleEnd$)
    ).subscribe((list: Todo[]) => {
      this.todoList = list;
      if(this.table) {
        this.table.renderRows();
      }
    });
  }

  /**
   * On todo form submit
   */
  onSubmit() {
    if(this.todoForm.valid) {
      if(this.createMode) {
        this.add();
      }
      else {
        this.update();
      }

      this.todoNgForm.resetForm();
      this.createMode = this.editMode = false;
    }
  }

    /**
   * Add an to do
   */
     add() {
      this.createMode = true;
      this.editMode = false;

      if(this.todoForm.valid) {
        this._todoService.addRecord(this.todoForm.value).pipe(
          take(1)
        ).subscribe((todo: Todo) => {
          if(todo) {
            this.alert = {
              type: 'alert-success',
              msg: 'A to do record has been added successfully.'
            };
          }
          else {
            this.alert = {
              type: 'alert-danger',
              msg: 'An error occurred while saving the to do record.'
            };
          }
        });
      }
    }

    /**
     * Enable update of a to do record
     */

    enableUpdate(model: Todo) {
      this.editMode = true;
      this.createMode = false;

      this.todoForm.setValue({
        id: model.id,
        title: model.title,
        description: model.description,
        status: model.status,
        date: model.date
      });

    }

    /**
     * Perform the update
     */
    update(){
      if(this.todoForm.valid) {
        this._todoService.updateRecord(this.todoForm.value).pipe(
          take(1)
        ).subscribe((todo) => {
          if(todo) {
            this.alert = {
              type: 'alert-success',
              msg: 'The to do record has been updated successfully.'
            };
          }
          else {
            this.alert = {
              type: 'alert-danger',
              msg: 'An error occurred while updating the to do record.'
            };
          }
        });
      }
    }

    /**
     * Delete an to do
     */
    delete(id: number) {

      this._dialog.open(ConfirmationDialogComponent, {
        data: {
          heading: 'Confirm delete action',
          message: 'Are you sure you want to delete the to do record? The action can not be undone.'
        }
      }).afterClosed().subscribe((ok) => {
        if(ok) {
          this._todoService.deleteRecord(id).pipe(
            take(1)
          ).subscribe((isDeleted) => {
            this.alert = {
              type: isDeleted? 'alert-success': 'alert-danger',
              msg: isDeleted? 'The to do record has been deleted.' : 'An error occurred while deleting the to do record.'
            }
          });
        }
      })

    }

   /**
   * cancel operation
   */

    cancel(): void {
      this.alert = null;
      this.createMode = this.editMode = false;
      this.todoNgForm.resetForm();
    }

    /**
     * mode change
     */
    selectMode(createMode: boolean) {
      if(createMode) {
        this.createMode = true;
        this.editMode = false;
      }
      else {
        this.createMode = false;
        this.editMode = true;
      }
    }

    /**
     * Get css class name for status
     */
    getClassName(status: string) {
      switch(status) {
        case "awaiting": return "bg-info";
        case "done": return "bg-primary";
        case "canceled": return "bg-danger";
        default: return "bg-dark";
      }
    }

  ngOnDestroy(): void {
    this._lifeCycleEnd$.next();
    this._lifeCycleEnd$.complete();
  }


}
