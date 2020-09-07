<template>
    <section class="section-hero section-shaped my-0">
        <div class="shape shape-style-1 shape-primary">
            <span class="span-150"></span>
            <span class="span-50"></span>
            <span class="span-50"></span>
            <span class="span-75"></span>
            <span class="span-100"></span>
            <span class="span-75"></span>
            <span class="span-50"></span>
            <span class="span-100"></span>
            <span class="span-50"></span>
            <span class="span-100"></span>
        </div>
        <div class="container shape-container d-flex align-items-center">
            <div class="col px-0">
                <div class="row justify-content-center align-items-center">
                    <div class="col-lg-7 text-center pt-lg">
                        <h1 class="text-white">Image similarity</h1>
                        <p class="lead text-white mt-4 mb-5">Compare the similarity probability of two image from copyright protection perspective.</p>
                        <div class="input-group row">
                            <base-input placeholder="Please input your Ethereum public address" class="normal-input col-md-12" v-model="publicAddress"></base-input>
                            <base-input placeholder="Please input your seed phrase" class="normal-input col-md-12" type="password" v-model="seedPhrase"></base-input>
                        </div>
                        <el-upload
                            :on-change="change"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            ref="uploadForm"
                            class="upload-demo"
                            action="#"
                            drag
                            :auto-upload="false"
                            accept=".jpeg,.jpg,.png"
                            :file-list="fileList"
                            multiple>
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">Drag image file here, or <em>Click</em> to upload</div>
                            <div class="el-upload__tip text-white" slot="tip">Only jpg/png files are accepted，and the file should be less than 10MB</div>
                        </el-upload>
                        <div class="btn-wrapper">
                            
                            <base-button tag="a"
                                         @click="submitUpload"
                                         class="mb-3 mb-sm-0"
                                         type="white"
                                         icon="ni ni-cloud-upload-96">
                                Upload
                            </base-button>
                        </div>
                        
                    </div>
                </div>
                <el-table
                    class="predict-table"
                    v-for="(table, key) in tableData"
                    :key="key"
                    :data="table"
                    :span-method="objectSpanMethod"
                    style="width: 100%">
                    <el-table-column
                        prop="filename"
                        label="Filename"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="class"
                        label="Class"
                        width="360">
                    </el-table-column>
                    <el-table-column
                        prop="confidence"
                        label="Confidence">
                    </el-table-column>
                </el-table>
                <div class="row align-items-center justify-content-around stars-and-coded">
                    <div class="col-md-12 text-center">
                        <span class="text-white alpha-7 ml-3">Star me on</span>
                        <a href="https://github.com/GetALittleRough/webApp" target="_blank" title="Support us on Github">
                            <img src="img/brand/github-white-slim.png" style="height: 22px; margin-top: -3px">
                        </a>
                    </div>
                </div>
            </div>

            <el-dialog
                title="View picture"
                :visible.sync="dialogVisible"
                width="50%"
                >
                <span><img :src="imageUrl" alt="" class="box-image"></span>
                <span slot="footer" class="dialog-footer">
                <base-button type="secondary" @click="dialogVisible = false">OK</base-button>
                <!-- <base-button type="primary" @click="dialogVisible = false">确 定</base-button> -->
                </span>
            </el-dialog>
        </div>
    </section>
</template>
<script>
import axios from 'axios'
export default {
    data() {
        return {
            dialogVisible: false,
            imageUrl: '',
            fileList: [],
            acceptFiles: ['image/jpeg', 'image/jpg', 'image/png'],
            // tableData: [{
            //     "filename": "t.jpg",
            //     "class":"Labrador retriever",
            //     "confidence":60.26504135131836 
            // }, {
            //     "filename": "t.jpg",
            //     "class":"Labrador retriever",
            //     "confidence":60.26504135131836
            // }, {
            //     "filename": "t.jpg",
            //     "class":"Labrador retriever",
            //     "confidence":60.26504135131836
            // }, {
            //     "filename": "t.jpg",
            //     "class":"Labrador retriever",
            //     "confidence":60.26504135131836
            // }, {
            //     "filename": "t.jpg",
            //     "class":"Labrador retriever",
            //     "confidence":60.26504135131836
            // }]
            tableData: [],
            distribute: false,
            publicAddress: '',
            seedPhrase: ''
        };
    },
    methods: {
        change(file, fileList) {
            if(this.beforeUpload(file)) {
                this.fileList.push(file)
            }
        },
        handleRemove(file, fileList) {
            this.fileList = fileList
            this.tableData.pop()
        },
        beforeUpload(file) {
            const isLt10M = file.size / 1024 / 1024 < 5
            if(!isLt10M) {
                this.$message.error('Image size must be less than 10MB')
            }
            return isLt10M
        },
        submitUpload() {
            this.tableData = []
            if(this.fileList.length == 0) {
                this.$message.error('No file specified')
                return
            }
            let flag = true
            this.fileList.forEach(file => {
                if(this.acceptFiles.indexOf(file.raw.type) == -1) {
                    flag = false
                }
            })
            if(!flag) {
                this.$message.error('Only accept jpg and png images!')
            }
            
            if(this.distribute) {
                console.time('bulk')
                axios.get(this.global.baseUrl + "/workers/").then(res => {
                    const workers = res.data.workers
                    const workersCount = workers.length
                    const arrList = []
                    
                    for(let i=0; i<workersCount; i++) {
                        arrList.push(new Array())
                    }
                    for(let i=0; i<this.fileList.length; i++) {
                        arrList[i % workersCount].push(this.fileList[i])
                    }
                    for(let i=0; i<workersCount; i++) {
                        this.sendFiles(arrList[i], workers[i])
                    }
                }).catch(err => {
                    console.error(err)
                })
            } else {
                console.time('single')
                this.sendFiles(this.fileList, this.global.baseUrl)
                
            }
        },
        handlePreview(file) {
            const reader = new FileReader();
            reader.readAsDataURL(file.raw)
            reader.onloadend = (ev) => {
                this.imageUrl = ev.target.result
                this.dialogVisible = true
            }
        }, 
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex == 0 && rowIndex == 0) {
                return {
                    rowspan: 5,
                    colspan: 1
                }
            } else if(columnIndex == 0 && rowIndex != 0) {
                return {
                    rowspan: 0,
                    colspan: 0
                }
            }
        },
        sendFiles(files, url) {
            if(files.length == 0) return
            let formData = new FormData()
            const headerConfig = {headers: {'Content-Type': 'multipart/form-data'}}
            let flag = true
            files.forEach(file => {
                formData.append('files', file.raw)
                
            })
            if(!flag) {
                this.$message.error('Only accept jpg and png images!')
            }
            const images = formData.get('files')
            formData.append('publicAddress', this.publicAddress)
            formData.append('seedPhrase', this.seedPhrase)
            if(images == null) {
                this.$message.error('No file specified')
            } else {
                axios.post(url+"/writechain/", formData, headerConfig).then(res => {
                    console.log(res)

                }).catch(err => {
                    console.error(err)
                })
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.btn-wrapper {
    margin: 2vh auto;
}
.box-image {
  width: 100%;
}
.modal-dialog {
  max-width: 50%;
}
.el-upload-list {
    background-color: #fff;
}
.predict-table {
    margin-top: 2vh;
}
.distribute-hint {
    color: #fff;
}
</style>
