import { Injectable } from "@angular/core";
import { Observable, of, ReplaySubject } from "rxjs";
import { take } from "rxjs/operators";
import { Todo } from "./todo-types";

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private _todoList: ReplaySubject<Todo[]> = new ReplaySubject<Todo[]>(1);

  /**
   * Ideal for injecting HttpClient service to call backend APIs
   */
  constructor(){

    try {
      const localStore = localStorage.getItem('todoList');
      if(localStore) {
        const todoList: Todo[] = JSON.parse(localStore);
        this._todoList.next(todoList);
      }
      else {
        this.initLocalStore();
      }
    }
    catch{
      this.initLocalStore();
    }

  }

  /**
   * Getter for Todo list
   */
  get todoList() {
    return this._todoList.asObservable();
  }

    /**
   * Initialize a local store by using the local storage.
   */
     initLocalStore(): void {
      let todoList: Todo[] = [];
      localStorage.setItem('todoList', JSON.stringify(todoList));
      this._todoList.next(todoList);
    }

  /**
   * Add a to do record
   */
  addRecord(model: Todo): Observable<Todo> {
    //Call backend API to add the record, then update _todoList

    //Set id
    model.id = this.generateRandomInteger();

    this._todoList.pipe(
      take(1)
    ).subscribe((list: Todo[]) => {
      list.push(model);
      this._todoList.next(list);

      //Update local store
      localStorage.setItem('todoList', JSON.stringify(list));
    });

    return of(model);
  }

  /**
   * Update a to do record
   */
   updateRecord(model: Todo): Observable<Todo> {
    //Call backend API to update the record, then update _todoList

    this._todoList.pipe(
      take(1)
    ).subscribe((list: Todo[]) => {
      let idx = list.findIndex(todo => todo.id === model.id);
      if(idx !== -1) {
        list[idx] = model;
        this._todoList.next(list);

        //Update local store
      localStorage.setItem('todoList', JSON.stringify(list));
      }
    });

    return of(model);
  }

   /**
   * Delete a to do record
   */
    deleteRecord(id: number): Observable<boolean> {
      //Call backend API to delete the record, then update _todoList

      this._todoList.pipe(
        take(1)
      ).subscribe((list: Todo[]) => {
        let idx = list.findIndex(todo => todo.id === id);
        if(idx !== -1) {
          list.splice(idx, 1);
          this._todoList.next(list);

          //Update local store
          localStorage.setItem('todoList', JSON.stringify(list));
        }
      });

      return of(true);
    }

  // Generate a number between 0 and 10000
  private generateRandomInteger(): number {
    return Math.floor(Math.random() * 10000) + 1;
  }
}
