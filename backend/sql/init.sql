-- Initial database setup for Cafe System Enterprise
CREATE DATABASE IF NOT EXISTS cafe_db;
USE cafe_db;

CREATE TABLE IF NOT EXISTS funcionarios (
    codigo VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    rfid VARCHAR(50) UNIQUE NULL
);

CREATE TABLE IF NOT EXISTS cafe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    valor FLOAT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_data (data)
);

-- Sample employee data
INSERT IGNORE INTO funcionarios (codigo, nome) VALUES
('001', 'Ana Silva'),
('002', 'Bruno Costa'),
('003', 'Carla Mendes'),
('004', 'Diego Ferreira'),
('005', 'Elena Souza');
