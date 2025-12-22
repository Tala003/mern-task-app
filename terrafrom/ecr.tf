resource "aws_ecr_repository" "services" {
  for_each = toset(["auth-service", "task-service", "notification-service", "frontend"])
  name     = "${var.project_name}-${each.key}"
  force_delete = true
}