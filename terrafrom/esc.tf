# 1. The Cluster (The "Folder" for all your services)
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# --- AUTH SERVICE ---

# 2. Auth Task Definition (The Blueprint)
resource "aws_ecs_task_definition" "auth" {
  family                   = "auth-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "auth-service"
    image     = "${aws_ecr_repository.services["auth-service"].repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 4000 }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/auth-service"
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
    environment = [
      { name = "MONGO_URI", value = var.mongo_uri },
      { name = "PORT", value = "4000" }
    ]
  }])
}

# 3. Auth Service (The Manager)
resource "aws_ecs_service" "auth" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = aws_subnet.public[*].id # In prod, use private subnets
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.auth_tg.arn
    container_name   = "auth-service"
    container_port   = 4000
  }
}

# --- TASK SERVICE ---

# 4. Task Service Task Definition
resource "aws_ecs_task_definition" "task" {
  family                   = "task-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "task-service"
    image     = "${aws_ecr_repository.services["task-service"].repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 4001 }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/task-service"
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
    environment = [
      { name = "MONGO_URI", value = var.mongo_uri },
      { name = "PORT", value = "4001" }
    ]
  }])
}

# 5. Task Service (The Manager)
resource "aws_ecs_service" "task" {
  name            = "task-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.task_tg.arn
    container_name   = "task-service"
    container_port   = 4001
  }
}

# 6. CloudWatch Log Groups (So you can see your node.js logs)
resource "aws_cloudwatch_log_group" "auth" { name = "/ecs/auth-service" }
resource "aws_cloudwatch_log_group" "task" { name = "/ecs/task-service" }