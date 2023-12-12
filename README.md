# angular-nkmcqc-ebxz6b

[Edit in Codeflow ⚡️](https://stackblitz.com/~/github.com/tamyfabius/angular-nkmcqc-ebxz6b)

Jenkins example config:
// The artifactory server id as configured in Jenkin's settings.
def artifactory_server_id = "SU7-Artifactory"
// The artifactory repository name.
def artifactory_repository = "su7-generic-frontend"
// The base archive and top-level artifactory repository folder name.
def skynes_base_archive_name = "01-pres-v4"
def portail_dof_v0_base_archive_name = "portail-dof-v0"

// The name of the branch with slashes replaced by underscores.
def formatted_branch_name = BRANCH_NAME.replace('/', '_')
// The artifactory version. For now, we use the branch name followed by the Jenkins build number.
def version = "${formatted_branch_name}-${BUILD_NUMBER}"
// The name of the published archive.
def skynes_archive_prefix = "${skynes_base_archive_name}-${version}"
def portail_dof_v0_archive_prefix = "${portail_dof_v0_base_archive_name}-${version}"
// The full name of the published archive including the file extension.
def skynes_archive_name = "${skynes_archive_prefix}.zip"
def portail_dof_v0_archive_name = "${portail_dof_v0_archive_prefix}.zip"
// The full path of the artifact in the repository.
def skynes_archive_artifactory_path = "${artifactory_repository}/${skynes_base_archive_name}/${formatted_branch_name}/${skynes_archive_name}"
def portail_dof_v0_archive_artifactory_path = "${artifactory_repository}/${portail_dof_v0_base_archive_name}/${formatted_branch_name}/${portail_dof_v0_archive_name}"

// The parent folder of application builds relative to the workspace.
def base_dist_directory = "dist/apps"

pipeline {
    agent {
        docker {
            image 'skynes-front'
            label 'generic-slave'
            args "--entrypoint=''"
        }
    }
    options {
        skipStagesAfterUnstable()
    }
    stages {
        stage('Install NPM packages') {
            steps {
                sh "sed -i s,1.0.0,${version},g `find . -name \"environment.prod.ts\"`"
                sh "npm config set loglevel='http'"
                sh "npm config set registry https://artifactory.f.bbg/artifactory/api/npm/g-npm-89c3/"
                sh "npm set progress=false && CYPRESS_INSTALL_BINARY=0 npm install --legacy-peer-deps"
            }
        }
        stage('Validate') {
            steps {
                sh "echo ok"
                //sh "npm run lint:ci"
            }
        }
        stage('Build the application') {
            steps {
                sh "npm run build-skynes"
                sh "npm run build-portail-dof"
            }
        }
        stage('Package the application') {
            when {
                expression { BRANCH_NAME == 'develop' }
            }
            steps {
                //sh "mkdir ${base_dist_directory}/${skynes_archive_prefix}"
                sh "mv ${base_dist_directory}/${skynes_base_archive_name} ."
                sh "zip -r ${skynes_archive_name} ${skynes_base_archive_name} -x \"**/.scannerwork/*\""
                //zip dir: "${base_dist_directory}/${skynes_archive_prefix}", zipFile: "${skynes_archive_name}", exclude: "**/.scannerwork/*"
                //sh "mkdir ${base_dist_directory}/${portail_dof_v0_archive_prefix}"
                sh "mv ${base_dist_directory}/${portail_dof_v0_base_archive_name} ."
                sh "zip -r ${portail_dof_v0_archive_name} ${portail_dof_v0_base_archive_name} -x \"**/.scannerwork/*\""
                //zip dir: "${base_dist_directory}/${portail_dof_v0_archive_prefix}", zipFile: "${portail_dof_v0_archive_name}"
                sh "cp .ci/deployit.xml .ci/${skynes_base_archive_name}.xml"
                sh "cp .ci/deployit.xml .ci/${portail_dof_v0_base_archive_name}.xml"
                sh "sed -i s,XLDEPLOY_VERSION,${version},g .ci/${skynes_base_archive_name}.xml"
                sh "sed -i s,XLDEPLOY_APPLICATION,01-pres-v4,g .ci/${skynes_base_archive_name}.xml"
                sh "sed -i s,XLDEPLOY_ARCHIVE_NAME,01-pres-v4,g .ci/${skynes_base_archive_name}.xml"
                sh "sed -i s,Zip.PATH,${skynes_archive_name},g .ci/${skynes_base_archive_name}.xml"

                sh "sed -i s,XLDEPLOY_VERSION,${version},g .ci/${portail_dof_v0_base_archive_name}.xml"
                sh "sed -i s,XLDEPLOY_APPLICATION,DOFIN,g .ci/${portail_dof_v0_base_archive_name}.xml"
                sh "sed -i s,XLDEPLOY_ARCHIVE_NAME,portail-dof-v0,g .ci/${portail_dof_v0_base_archive_name}.xml"
                sh "sed -i s,Zip.PATH,${portail_dof_v0_archive_name},g .ci/${portail_dof_v0_base_archive_name}.xml"
            }
        }
        /*stage('Sonar') {
            when {
                expression { BRANCH_NAME == 'develop' }
            }
            steps {
                sh "sonar-scanner -Dsonar.language=py \
                  -Dsonar.host.url=\"https://sqill.mycloud.intranatixis.com/sonar\" \
                  -Dsonar.projectName=\"[NXSU7] - Skynesback\" \
                  -Dsonar.projectKey=\"NXSU7-Skynesback\" \
                  \"-Dsonar.projectVersion=${version}\" \
                  -Dsonar.sources=. -Dsonar.c.file.suffixes=- -Dsonar.cpp.file.suffixes=- -Dsonar.objc.file.suffixes=- "
            }
        }*/
        stage('Publish the application') {
            when {
                expression { BRANCH_NAME == 'develop' }
            }
            steps {
                echo "Creating XL Deploy package..."
                xldCreatePackage artifactsPath: '', manifestPath: ".ci/${skynes_base_archive_name}.xml", darPath: "${skynes_base_archive_name}-${version}.dar"
                xldCreatePackage artifactsPath: '', manifestPath: ".ci/${portail_dof_v0_base_archive_name}.xml", darPath: "${portail_dof_v0_base_archive_name}-${version}.dar"
                echo "XL Deploy package created successfully"
                xldPublishPackage darPath: "${skynes_base_archive_name}-${version}.dar", serverCredentials: "Technical Account GMK XLDeploy/XLRelease"
                xldPublishPackage darPath: "${portail_dof_v0_base_archive_name}-${version}.dar", serverCredentials: "Technical Account GMK XLDeploy/XLRelease"
                echo "XL Deploy package published successfully..."
            }
        }
        stage('Deploy the application') {
            when {
                expression { BRANCH_NAME == 'develop' }
            }
            steps {
                xldDeploy serverCredentials: "Technical Account GMK XLDeploy/XLRelease", environmentId: "Environments/SU7/DEV/SKYNES-FRONT/SKYNES-FRONT-DEV", packageId: "Applications/SU7/01-pres-v4/${version}"
                xldDeploy serverCredentials: "Technical Account GMK XLDeploy/XLRelease", environmentId: "Environments/SU7/DEV/SKYNES-FRONT/SKYNES-FRONT-DEV", packageId: "Applications/SU7/DOFIN/${version}"
                echo "XL Deploy package deployed successfully..."
            }
        }
    }
    post {
        always {
           cleanWs deleteDirs : true
        }
        cleanup {
            cleanWs deleteDirs : true
        }
    }
}
