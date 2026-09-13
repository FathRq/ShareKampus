# ---- Tahap 1: Builder ----
FROM golang:1.25.12-alpine AS builder

WORKDIR /app

# Copy go.mod & go.sum dulu (terpisah dari source code)
COPY go.mod go.sum ./
RUN go mod download

# Baru copy seluruh source code
COPY . .

# Compile jadi 1 binary statis, dinamai "server"
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

# ---- Tahap 2: Final (image kecil) ----
FROM alpine:latest

WORKDIR /app

# Copy HANYA hasil binary dari tahap builder, bukan source code-nya
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]