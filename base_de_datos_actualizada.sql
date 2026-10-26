-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: nathalies_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activos_fijos`
--

DROP TABLE IF EXISTS `activos_fijos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activos_fijos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Equipo',
  `valor_compra` decimal(10,2) NOT NULL,
  `fecha_compra` date NOT NULL,
  `estado` enum('Activo','Vendido','Baja') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activos_fijos`
--

LOCK TABLES `activos_fijos` WRITE;
/*!40000 ALTER TABLE `activos_fijos` DISABLE KEYS */;
INSERT INTO `activos_fijos` VALUES (1,'Lámpara UV Profesional','Equipo',1500.00,'2024-01-15','Activo','2026-09-28 05:55:52'),(2,'Silla ergonómica de trabajo','Mobiliario',2500.00,'2024-02-01','Activo','2026-09-28 05:55:52'),(3,'Computadora de escritorio','Tecnología',12000.00,'2023-11-10','Activo','2026-09-28 05:55:52'),(4,'Camilla','Mobiliario',150.00,'2026-09-16','Activo','2026-09-28 06:12:18'),(5,'mesa ','Mobiliario',20.00,'2026-02-19','Activo','2026-10-12 23:49:58'),(6,'lapto','Tecnología',100.00,'2011-12-19','Activo','2026-10-14 20:06:05');
/*!40000 ALTER TABLE `activos_fijos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('insumo','gasto','servicio') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Esmaltes','insumo','2026-09-15 00:55:18'),(2,'Geles','insumo','2026-09-15 00:55:18'),(3,'acrilatos','insumo','2026-09-15 00:55:18'),(4,'Herramientas','insumo','2026-09-15 00:55:18'),(5,'Alquiler','gasto','2026-09-15 00:55:18'),(6,'Servicios básicos','gasto','2026-09-15 00:55:18'),(7,'Marketing','gasto','2026-09-15 00:55:18'),(8,'Mantenimiento','gasto','2026-09-15 00:55:18'),(9,'Otros','gasto','2026-09-15 00:55:18'),(10,'Uñas','servicio','2026-09-23 07:00:50'),(11,'Pestañas','servicio','2026-09-23 07:00:50'),(12,'Cejas','servicio','2026-09-23 07:00:50'),(13,'Pelo','servicio','2026-09-23 07:00:50');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cierres_caja`
--

DROP TABLE IF EXISTS `cierres_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cierres_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `ventas_total` decimal(10,2) NOT NULL,
  `ventas_efectivo` decimal(10,2) NOT NULL,
  `ventas_transferencia` decimal(10,2) NOT NULL,
  `ventas_tarjeta` decimal(10,2) NOT NULL,
  `gastos_efectivo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `efectivo_esperado` decimal(10,2) NOT NULL,
  `efectivo_real` decimal(10,2) NOT NULL,
  `diferencia` decimal(10,2) NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `usuario_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cierres_caja_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cierres_caja`
--

LOCK TABLES `cierres_caja` WRITE;
/*!40000 ALTER TABLE `cierres_caja` DISABLE KEYS */;
INSERT INTO `cierres_caja` VALUES (1,'2026-09-25',54.00,18.00,36.00,0.00,0.00,18.00,18.00,0.00,'basuraaa',1,'2026-09-26 00:30:35'),(2,'2026-09-27',20.00,20.00,0.00,0.00,0.00,40.00,40.00,0.00,'',1,'2026-09-27 21:24:04'),(3,'2026-10-05',51.00,51.00,0.00,0.00,0.00,151.00,151.00,0.00,'',1,'2026-10-05 21:42:12'),(4,'2026-10-13',0.00,0.00,0.00,0.00,0.00,30.00,100.00,70.00,'todo bien',1,'2026-10-13 02:26:02');
/*!40000 ALTER TABLE `cierres_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date NOT NULL,
  `proveedor_id` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado_pago` enum('Pagada','Pendiente') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pendiente',
  `metodo_pago` enum('Efectivo','Transferencia','Tarjeta') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,'COM-0001','2026-09-28',4,80.00,'Pagada','Transferencia',NULL,1,'2026-09-28 03:49:52'),(2,'COM-0002','2026-09-28',4,100.00,'Pagada','Transferencia',NULL,1,'2026-09-28 04:30:34'),(3,'COM-0003','2026-09-28',1,80.00,'Pagada','Transferencia','2026-09-30',1,'2026-09-28 04:33:57'),(4,'COM-0004','2026-09-28',1,20.00,'Pagada','Efectivo','2026-09-30',1,'2026-09-28 05:29:12'),(5,'COM-0005','2026-10-05',1,0.00,'Pagada','Efectivo',NULL,1,'2026-10-05 04:30:54'),(6,'COM-0006','2026-10-05',1,100.00,'Pagada','Efectivo','2026-10-06',1,'2026-10-05 05:18:20'),(7,'COM-0007','2026-10-05',1,120.00,'Pagada','Efectivo',NULL,1,'2026-10-05 05:18:44'),(8,'COM-0008','2026-10-06',2,0.00,'Pagada','Transferencia','2026-10-30',1,'2026-10-06 04:09:53'),(9,'COM-0009','2026-10-14',1,20.00,'Pagada','Efectivo',NULL,1,'2026-10-14 19:57:27'),(10,'COM-0010','2026-10-14',2,20.00,'Pagada','Efectivo',NULL,1,'2026-10-14 20:00:33'),(11,'COM-0011','2026-10-19',5,20.00,'Pagada','Efectivo',NULL,1,'2026-10-19 13:54:50'),(12,'COM-0012','2026-10-19',5,85.00,'Pagada','Tarjeta',NULL,1,'2026-10-19 14:05:16'),(13,'COM-0013','2026-10-19',2,300.00,'Pagada','Efectivo',NULL,1,'2026-10-19 14:06:04'),(14,'COM-0014','2026-10-19',4,100.00,'Pagada','Efectivo','2026-12-16',1,'2026-10-19 14:07:50'),(15,'COM-0015','2026-10-19',1,20.00,'Pagada','Efectivo',NULL,1,'2026-10-19 16:02:45'),(16,'COM-0016','2026-10-19',1,20.00,'Pagada','Efectivo',NULL,1,'2026-10-19 17:25:42'),(17,'COM-0017','2026-10-19',1,20.00,'Pagada','Tarjeta',NULL,1,'2026-10-19 17:26:09'),(18,'COM-0018','2026-10-19',1,199.50,'Pagada','Efectivo','2026-10-20',1,'2026-10-19 17:27:46'),(19,'COM-0019','2026-10-19',4,97.00,'Pagada','Efectivo','2026-10-20',1,'2026-10-19 17:38:40');
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `valor` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'nombre_negocio','Nathalie System','Nombre oficial del negocio'),(2,'telefono','','Teléfono de contacto principal'),(3,'direccion','','Dirección física del negocio'),(4,'correo','','Correo electrónico de contacto'),(5,'mensaje_ticket','¡Gracias por su preferencia!','Mensaje que aparece al final de los tickets o reportes');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_por_pagar`
--

DROP TABLE IF EXISTS `cuentas_por_pagar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_por_pagar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `proveedor_id` int NOT NULL,
  `monto_original` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT '0.00',
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('Pendiente','Pagada','Vencida') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `idx_cxp_estado` (`estado`),
  KEY `idx_cxp_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `cuentas_por_pagar_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cuentas_por_pagar_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_pagar`
--

LOCK TABLES `cuentas_por_pagar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_pagar` DISABLE KEYS */;
INSERT INTO `cuentas_por_pagar` VALUES (1,3,1,80.00,80.00,'2026-09-30','Pagada','2026-09-28 04:33:57'),(2,4,1,20.00,20.00,'2026-09-30','Pagada','2026-09-28 05:29:12'),(3,6,1,100.00,100.00,'2026-10-06','Pagada','2026-10-05 05:18:20'),(4,8,2,0.00,0.00,'2026-10-30','Pagada','2026-10-06 04:09:53'),(5,14,4,100.00,100.00,'2026-12-16','Pagada','2026-10-19 14:07:50'),(6,18,1,199.50,200.00,'2026-10-20','Pagada','2026-10-19 17:27:46'),(7,19,4,97.00,100.00,'2026-10-20','Pagada','2026-10-19 17:38:40');
/*!40000 ALTER TABLE `cuentas_por_pagar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compras`
--

DROP TABLE IF EXISTS `detalle_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `tipo` enum('producto','insumo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `item_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compras`
--

LOCK TABLES `detalle_compras` WRITE;
/*!40000 ALTER TABLE `detalle_compras` DISABLE KEYS */;
INSERT INTO `detalle_compras` VALUES (1,1,'insumo',11,4,20.00,80.00),(2,2,'insumo',11,5,20.00,100.00),(3,3,'insumo',9,4,20.00,80.00),(4,4,'insumo',9,1,20.00,20.00),(5,5,'producto',9,16,0.00,0.00),(6,6,'producto',9,5,0.00,0.00),(7,6,'producto',8,5,0.00,0.00),(8,6,'producto',11,5,20.00,100.00),(9,7,'producto',11,6,20.00,120.00),(10,8,'producto',8,5,0.00,0.00),(11,9,'producto',10,1,0.00,0.00),(12,9,'insumo',9,1,20.00,20.00),(13,10,'insumo',9,1,20.00,20.00),(14,11,'producto',8,1,20.00,20.00),(15,12,'producto',9,5,17.00,85.00),(16,13,'producto',11,15,20.00,300.00),(17,14,'insumo',11,5,20.00,100.00),(18,15,'producto',12,1,20.00,20.00),(19,16,'producto',12,1,20.00,20.00),(20,17,'producto',12,1,20.00,20.00),(21,18,'producto',9,1,17.00,17.00),(22,18,'producto',12,1,20.00,20.00),(23,18,'producto',8,2,20.00,40.00),(24,18,'producto',10,1,10.00,10.00),(25,18,'producto',11,3,10.00,30.00),(26,18,'insumo',12,2,10.00,20.00),(27,18,'insumo',13,2,10.00,20.00),(28,18,'insumo',11,1,20.00,20.00),(29,18,'insumo',9,1,20.00,20.00),(30,18,'insumo',10,1,2.50,2.50),(31,19,'producto',9,1,17.00,17.00),(32,19,'producto',12,4,20.00,80.00);
/*!40000 ALTER TABLE `detalle_compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `tipo` enum('servicio','producto') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `item_id` int NOT NULL,
  `nombre_item` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES (1,1,'servicio',8,'Soft gel s',1,18.00,18.00),(2,2,'servicio',3,'Pedicure clásico',2,18.00,36.00),(3,3,'servicio',3,'Pedicure clásico',1,18.00,18.00),(4,4,'producto',8,'Cartera rosa con pedrería ',1,20.00,20.00),(5,5,'servicio',8,'Soft gel s',18,18.00,324.00),(6,6,'servicio',8,'Soft gel s',11,18.00,198.00),(7,7,'servicio',8,'Soft gel s',5,18.00,90.00),(10,9,'producto',9,'cartera amarilla',17,17.00,289.00),(11,9,'servicio',8,'Soft gel s',1,18.00,18.00),(12,10,'producto',9,'cartera amarilla',3,17.00,51.00),(13,11,'producto',11,'tilin',1,10.00,10.00),(14,12,'producto',8,'Cartera rosa con pedrería ',4,20.00,80.00),(15,13,'producto',8,'Cartera rosa con pedrería ',1,20.00,20.00),(16,14,'producto',12,'cadena enchape',2,20.00,40.00),(17,15,'producto',9,'cartera amarilla',1,17.00,17.00),(18,16,'producto',12,'cadena enchape',2,20.00,40.00),(19,17,'producto',12,'cadena enchape',2,20.00,40.00),(20,18,'producto',12,'cadena enchape',4,20.00,80.00),(21,19,'producto',9,'cartera amarilla',1,17.00,17.00);
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Transferencia','Tarjeta') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` int NOT NULL,
  `estado` enum('Activo','Anulado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `categoria_id` (`categoria_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_gastos_fecha` (`fecha`),
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
INSERT INTO `gastos` VALUES (1,'GAS-0001','2026-09-28','Pago de alquiler del mes',5,250.00,'Efectivo',1,'Anulado','2026-09-28 04:46:20'),(2,'GAS-0002','2026-10-04','agua',6,21.00,'Efectivo',1,'Activo','2026-10-05 05:16:06'),(3,'GAS-0003','2026-10-27','luz ',6,30.00,'Transferencia',1,'Activo','2026-10-12 23:32:48'),(4,'GAS-0004','2026-10-15','a',5,1112.00,'Efectivo',1,'Anulado','2026-10-15 00:01:44'),(5,'GAS-0005','2026-10-19','rrenta del local',5,100.00,'Efectivo',1,'Activo','2026-10-19 17:29:33');
/*!40000 ALTER TABLE `gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumos`
--

DROP TABLE IF EXISTS `insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `categoria_id` (`categoria_id`),
  KEY `idx_insumos_stock` (`stock`),
  CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumos`
--

LOCK TABLES `insumos` WRITE;
/*!40000 ALTER TABLE `insumos` DISABLE KEYS */;
INSERT INTO `insumos` VALUES (9,'INS-001','Acrílico cristal MS',3,20.00,9,3,'Activo','2026-09-27 21:33:04','2026-10-19 17:27:46'),(10,'ESM-001','esmalte nude',1,2.50,11,3,'Activo','2026-09-27 21:34:27','2026-10-19 17:27:46'),(11,'GEL-001','Tip para unas soft gel MS',2,20.00,6,1,'Activo','2026-09-28 01:47:19','2026-10-19 17:27:46'),(12,'ESM-002','esmalte rojo',1,10.00,22,3,'Activo','2026-10-15 02:09:43','2026-10-19 17:27:46'),(13,'ESM-003','esmalte verde',NULL,10.00,22,5,'Activo','2026-10-15 02:17:59','2026-10-19 17:27:46');
/*!40000 ALTER TABLE `insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `tipo` enum('Entrada','Salida','Ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `origen` enum('venta','compra','ajuste_manual','uso_interno') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `referencia_id` int DEFAULT NULL,
  `tipo_item` enum('producto','insumo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `item_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_nuevo` int NOT NULL,
  `usuario_id` int NOT NULL,
  `observaciones` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_movimientos_fecha` (`fecha`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Otros',
  `precio_venta` decimal(10,2) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_productos_stock` (`stock`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (8,'CAR-001','Cartera rosa con pedrería ','Carteras',20.00,15.00,8,5,'Activo','2026-09-25 22:38:28','2026-10-19 17:27:46'),(9,'CAR-002','cartera amarilla','Carteras',17.00,10.00,7,2,'Activo','2026-10-05 04:29:53','2026-10-19 17:38:40'),(10,'OTR-001','uñas postizas rapidas','Otro',10.00,6.00,14,3,'Activo','2026-10-13 02:49:12','2026-10-19 17:27:46'),(11,'JOY-001','tilin','Joyería',10.00,7.00,37,2,'Activo','2026-10-14 23:34:25','2026-10-19 17:27:46'),(12,'JOY-002','cadena enchape','Joyería',20.00,10.00,8,0,'Activo','2026-10-19 14:03:23','2026-10-19 17:38:40');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contacto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,NULL,'BellyNails S.A.','Sandra Pérez','5555-1234','ventas@bellynails.gt','Activo','2026-09-15 00:55:19','2026-09-15 00:55:19'),(2,NULL,'Distribuidora Glamour','Carlos Ruiz','5555-5678','pedidos@glamour.gt','Activo','2026-09-15 00:55:19','2026-09-15 00:55:19'),(3,NULL,'ProLash Supply','María García','5555-9012','info@prolash.gt','Activo','2026-09-15 00:55:19','2026-09-15 00:55:19'),(4,NULL,'Mía Secret','maría juana','12345678','mariajuana@gmail.com','Activo','2026-09-28 03:35:17','2026-09-28 03:35:17'),(5,'PROV-005','jorge','nada','70880796','jorge@gmail.com','Activo','2026-10-13 01:10:18','2026-10-13 01:10:18'),(6,'PROV-006','A','a','12345678','a@gmail.com','Activo','2026-10-15 00:00:47','2026-10-15 00:00:47'),(7,'PROV-007','jimi amaya','casa de bryan','13131344','jimi5654@gmail.com','Activo','2026-10-15 00:54:53','2026-10-15 00:54:53');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permisos` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema','[\"dashboard\",\"nueva-venta\",\"historial-ventas\",\"productos\",\"insumos\",\"servicios\",\"compras\",\"proveedores\",\"cuentas-pagar\",\"gastos\",\"contabilidad\",\"reportes\",\"usuarios\",\"configuracion\"]','2026-09-15 00:55:18'),(2,'Contador','Solo finanzas, reportes y contabilidad','[\"dashboard\",\"historial-ventas\",\"compras\",\"proveedores\",\"cuentas-pagar\",\"gastos\",\"contabilidad\",\"reportes\"]','2026-09-15 00:55:18'),(3,'Cajero','Ventas, cierre de caja e inventario (lectura)','[\"nueva-venta\",\"historial-ventas\",\"productos\",\"insumos\",\"servicios\"]','2026-09-15 00:55:18');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `precio` decimal(10,2) NOT NULL,
  `costo_estimado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_servicios_categoria` (`categoria_id`),
  CONSTRAINT `fk_servicios_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (7,'SRV-CEJAS-001','Laminado de cejas',12,'Laminado  + gena',7.00,3.00,'Inactivo','2026-09-23 07:09:27','2026-09-23 19:31:21'),(8,'SRV-UNAS-001','Soft gel s',10,'Uñas soft gel + Diseño ',18.00,7.00,'Activo','2026-09-25 18:15:31','2026-09-25 18:15:31'),(9,'SRV-CEJAS-002','Pigmento de labios',12,'',30.00,17.00,'Activo','2026-10-06 04:11:13','2026-10-06 04:11:13'),(10,'SRV-PELO-001','pelito',13,'nose',10.00,30.00,'Activo','2026-10-15 01:15:11','2026-10-15 01:15:11'),(11,'SRV-UNAS-002','uñas de navidad',10,'muy buenas',40.00,10.00,'Activo','2026-10-15 02:19:29','2026-10-15 02:19:29'),(12,'SRV-UNAS-003','uñas largas',10,'nose',3.00,11.00,'Activo','2026-10-19 16:01:49','2026-10-19 16:01:49'),(13,'SERV-013','jorge industris',NULL,NULL,0.00,0.00,'Activo','2026-10-19 16:03:46','2026-10-19 16:03:46');
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rol_id` int NOT NULL,
  `estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jessica Martínez','jessicamartinezchinchilla@gmail.com','$2y$12$z9HvgZMM3jH2E/fxEdznt.hA23YY5exfH/FLBfA2fmoF4LQ/aNdZu',1,'Activo','2026-09-15 00:55:18','2026-10-05 03:32:16'),(2,'Nicole Chinchilla','07mylittlepony07@gmail.com','$2y$12$5g6OCKzQhZtHYxY7LHdNJOMp/RBSdLjX3it8VRBdUz72iBohNu3Fq',3,'Activo','2026-09-15 00:55:18','2026-10-05 03:32:17'),(3,'Contador Principal','contador@nathalies.com','$2y$10$lNsRdRTxDwVEIGlhdcnhpO6bxJFPOQFbdZCNguBA33TxlHLkfsJCe',2,'Activo','2026-09-15 00:55:18','2026-10-26 16:10:18');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Transferencia','Tarjeta','Mixto') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `monto_efectivo` decimal(10,2) DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `usuario_id` int NOT NULL,
  `estado` enum('Completada','Anulada') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Completada',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_ventas_fecha` (`fecha`),
  KEY `idx_ventas_usuario` (`usuario_id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'VTA-0001','2026-09-25 18:22:20',18.00,'Efectivo',18.00,0.00,0.00,1,'Completada','2026-09-26 00:22:20'),(2,'VTA-0002','2026-09-25 18:22:38',36.00,'Transferencia',0.00,36.00,0.00,1,'Completada','2026-09-26 00:22:38'),(3,'VTA-0003','2026-09-25 18:30:54',18.00,'Efectivo',19.00,0.00,0.00,1,'Completada','2026-09-26 00:30:54'),(4,'VTA-0004','2026-09-27 15:22:35',20.00,'Efectivo',20.00,0.00,0.00,1,'Completada','2026-09-27 21:22:35'),(5,'VTA-0005','2026-09-27 23:07:03',324.00,'Efectivo',324.00,0.00,0.00,1,'Completada','2026-09-28 05:07:03'),(6,'VTA-0006','2026-09-28 20:40:06',198.00,'Efectivo',198.00,0.00,0.00,1,'Completada','2026-09-29 02:40:06'),(7,'VTA-0007','2026-10-04 22:27:41',90.00,'Transferencia',0.00,90.00,0.00,1,'Completada','2026-10-05 04:27:41'),(9,'VTA-0008','2026-10-04 23:14:02',307.00,'Efectivo',307.00,0.00,0.00,1,'Completada','2026-10-05 05:14:02'),(10,'VTA-0009','2026-10-05 15:41:06',51.00,'Efectivo',51.00,0.00,0.00,1,'Completada','2026-10-05 21:41:06'),(11,'VTA-0010','2026-10-14 19:42:03',10.00,'Efectivo',10.00,0.00,0.00,1,'Completada','2026-10-15 01:42:03'),(12,'VTA-0011','2026-10-18 17:05:19',80.00,'Efectivo',80.00,0.00,0.00,1,'Completada','2026-10-18 23:05:19'),(13,'VTA-0012','2026-10-19 08:00:17',20.00,'Efectivo',20.00,0.00,0.00,1,'Completada','2026-10-19 14:00:17'),(14,'VTA-0013','2026-10-19 09:05:29',40.00,'Efectivo',40.00,0.00,0.00,1,'Completada','2026-10-19 15:05:29'),(15,'VTA-0014','2026-10-19 09:12:22',17.00,'Efectivo',17.00,0.00,0.00,1,'Completada','2026-10-19 15:12:22'),(16,'VTA-0015','2026-10-19 09:22:37',40.00,'Efectivo',40.00,0.00,0.00,1,'Completada','2026-10-19 15:22:37'),(17,'VTA-0016','2026-10-19 09:34:22',40.00,'Efectivo',40.00,0.00,0.00,1,'Completada','2026-10-19 15:34:22'),(18,'VTA-0017','2026-10-19 09:36:27',80.00,'Transferencia',0.00,80.00,0.00,1,'Completada','2026-10-19 15:36:27'),(19,'VTA-0018','2026-10-19 09:59:29',17.00,'Efectivo',17.00,0.00,0.00,1,'Completada','2026-10-19 15:59:29');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'nathalies_db'
--

--
-- Dumping routines for database 'nathalies_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 10:59:25
