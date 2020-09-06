import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  signInForm: FormGroup;
  passwordVisible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    this.isLoading = true;
    this.authenticationService.signIn(this.signInForm.value).subscribe(
      (response) => {
        this.isLoading = false;
        if (response) this.router.navigate(['/products']);
        else this.messageService.create('error', 'Tài khoản không hợp lệ!');
      },
      (error) => {
        this.isLoading = false;
        this.messageService.create('error', 'Tài khoản không hợp lệ!');
      }
    );
  }
}