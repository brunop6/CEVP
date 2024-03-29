import { Component, OnInit } from '@angular/core';
import { collection, getFirestore, query, getDocs, orderBy } from 'firebase/firestore'
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateStudentDLGComponent } from './dialogs/create-student-dlg/create-student-dlg.component';
import { StudentService } from 'src/app/shared/services/student.service';
import * as DateFormat from 'src/app/shared/functions/dateFormat';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  private db = getFirestore();
  protected now: Date = new Date();
  protected students: any[];
  protected schools: any[];
  protected df: any = DateFormat;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.getStudents();
    this.getSchools();

    const sidebarCheck = document.querySelector("#check") as HTMLInputElement;
    let screenWidth = window.innerWidth;

    if(screenWidth >= 800) sidebarCheck.checked = true;
  }

  async getStudents() {
    const activated = document.querySelector('#activated') as HTMLSelectElement;

    this.students = activated.value == "true" ? await this.studentService.getAllStudents() : await this.studentService.getAllStudents(false);
  }

  async getSchools() {
    this.schools = [];
    const q = query(
      collection(this.db, 'schools'),
      orderBy('name')  
    );

    await getDocs(q).then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.schools.push({
          id: doc.id,
          name: doc.data()['name'],
          address: doc.data()['address'],
          city: doc.data()['city'],
          state: doc.data()['state'],
          cep: doc.data()['cep'],
          contact: doc.data()['contact']
        });
      });

      sessionStorage.setItem('schools', JSON.stringify(this.schools));
    });
  }

  redirectToStudentData(student: Object) {
    sessionStorage.setItem('student', JSON.stringify(student));
    this.router.navigate(['header/students/student']);
  }

  openDialogCreateStudent(): void {
    const dialogRef = this.dialog.open(CreateStudentDLGComponent, {
      width: '90%',
      data: {
        schools: this.schools
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
