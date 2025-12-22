# 1. The Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id
}

# 2. Target Group for Auth Service
resource "aws_lb_target_group" "auth_tg" {
  name        = "auth-service-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check { path = "/auth/health" } # Make sure you add this route in Express!
}

# 3. Target Group for Task Service
resource "aws_lb_target_group" "task_tg" {
  name        = "task-service-tg"
  port        = 4001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check { path = "/tasks/health" }
}

# 4. The Listener (Default sends to Frontend - you can add this later)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# 5. Routing Rules (Path-based routing)
resource "aws_lb_listener_rule" "auth_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth_tg.arn
  }
  condition {
    path_pattern { values = ["/auth/*"] }
  }
}

resource "aws_lb_listener_rule" "task_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.task_tg.arn
  }
  condition {
    path_pattern { values = ["/tasks/*"] }
  }
}