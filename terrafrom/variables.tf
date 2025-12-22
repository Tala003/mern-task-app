variable "aws_region" { default = "ap-south-1" }
variable "project_name" { default = "mern-task-app" }
variable "mongo_uri" { 
  type      = string 
  sensitive = true 
  default   = "mongodb+srv://user:pass@cluster.mongodb.net/dbname" # Update with your Atlas URI
}