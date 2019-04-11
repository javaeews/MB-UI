import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FileUploader } from "ng2-file-upload";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ResizeResponse } from "./resizeResponse"
import { saveAs, encodeBase64 } from '@progress/kendo-file-saver';
import * as JSZip from 'jszip';
import b64toBlob from 'b64-to-blob';



@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  uploadForm: FormGroup;
  imgFile: File;

  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });
  title: string = 'MB-UI';

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  uploadSubmit() {
    if (this.uploader.queue.length > 10) {
      alert("Maximálisan 10 fájl adható meg.");
      return;
    }
    for (var i = 0; i < this.uploader.queue.length; i++) {
      let fileItem = this.uploader.queue[i]._file;

      if (fileItem.size > 15000000) {
        alert("Maximális méret 15 MB.");
        return;
      }
    }

    let body = new FormData();

    for (var i = 0; i < this.uploader.queue.length; i++) {
      console.log(this.uploader.queue[i]._file);
      body.append("files", this.uploader.queue[i]._file);
    }

    body.append('xx', new Blob([JSON.stringify(this.uploadForm.controls.xx.value)], {
      type: "application/json"
    }));
    body.append('yy', new Blob([JSON.stringify(this.uploadForm.controls.yy.value)], {
      type: "application/json"
    }));

    this.uploadFile(body).subscribe(data => this.convert(data));


  }

  convert(data: ResizeResponse) {
    for (var i = 0; i < this.uploader.queue.length; i++) {
      let blobVar: Blob = b64toBlob(data.fileDtos[i].data, data.fileDtos[i].contentType);
      this.imgFile = new File([blobVar], data.fileDtos[i].fileName, { type: data.fileDtos[i].contentType });
      this.uploader.queue[i]._file = this.imgFile;
    }
  }

  uploadFile(data: FormData): Observable<ResizeResponse> {
    return this.http.post<ResizeResponse>('http://localhost:8760/mb/frontend/api/resize/resize-img', data, { responseType: 'json' });
  }

  downloadFileExample() {
    const jszip = new JSZip();

    for (var i = 0; i < this.uploader.queue.length; i++) {
       jszip.file(this.uploader.queue[i]._file.name, this.uploader.queue[i]._file);
    }

    jszip.generateAsync({ type: 'blob' }).then(function(content) {
      saveAs(content, 'images.zip');
    });
  }

  ngOnInit() {
    this.uploadForm = this.fb.group({
      document: [null, null],
      xx: [null, Validators.required],
      yy: [null, Validators.required]
    });
  }

}


