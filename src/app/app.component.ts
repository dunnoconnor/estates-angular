import { Component } from '@angular/core';
import { Task } from './task/task';
import { Die } from './die/die';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogResult, TaskDialogComponent } from './task-dialog/task-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
 

const getObservable = (collection: AngularFirestoreCollection<Die>) => {
  const subject = new BehaviorSubject<Die[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Die[]) => {
    subject.next(val);
  });
  return subject;
};

const generateDicePool = () =>{
  const dicePool : Die[] = [];
  const colors : string[] = ["red", "yellow", "green", "blue", "purple", "grey"]

  for(let index in colors){ 
    for (let i = 1; i <= 6; i++) {
      dicePool.push({value:i,color:colors[index]});
    }
  }
return dicePool;
}

const generateDiceRow = (dice: Die[]) =>{
  const diceRow: Die[] = [];
  for (let i = 0; i < 24; i++) {
    let rand : number = Math.floor(Math.random() * dice.length);
    let thisDie : Die[] = dice.splice(rand,1);
    diceRow.push(thisDie[0])
  }
  console.log(diceRow)
  return diceRow;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  title = 'estates-angular';

  market1 = getObservable(this.store.collection('market1')) as Observable<Die[]>;
  market2 = getObservable(this.store.collection('market2')) as Observable<Die[]>;
  market3 = getObservable(this.store.collection('market3')) as Observable<Die[]>;
  
  // todo = getObservable(this.store.collection('todo')) as Observable<Task[]>;
  // inProgress = getObservable(this.store.collection('inProgress')) as Observable<Task[]>;
  // done = getObservable(this.store.collection('done')) as Observable<Task[]>;
  
  constructor(private dialog: MatDialog, private store: AngularFirestore) {}
  
  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) => {
        if (!result) {
          return;
        }
        this.store.collection('todo').add(result.task);
      });
  }

  newGame(): void {
    const dice = generateDicePool();
    const row = generateDiceRow(dice);

    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.buildMarket(row)
      ]);
      return promise;
    });
  }


  buildMarket(row: Die[]): void {
    console.log("row", row)
    for (let i = 0; i < 8; i++) {
      this.store.collection('market1').add(row[i]);
    }
    for (let i = 8; i < 16; i++) {
      this.store.collection('market2').add(row[i]);
    }
    for (let i = 16; i < 24; i++) {
      this.store.collection('market3').add(row[i]);
    }
  }


  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult|undefined) => {
      if (!result) {
        return;
      }
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }

  drop(event: CdkDragDrop<Die[]|null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.previousContainer.data || !event.container.data) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}