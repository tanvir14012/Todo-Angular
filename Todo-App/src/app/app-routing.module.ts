import { TodoComponent } from './../todo/todo/todo.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: "", pathMatch: "full", redirectTo: "/todo"},

  {
    path: "",
    children: [
      { path: "todo", loadChildren: () => import("src/todo/todo.module").then(m => m.TodoModule)}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
