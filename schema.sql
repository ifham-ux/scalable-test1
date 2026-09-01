CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    no_id VARCHAR(50)
);


CREATE TABLE puisi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    tgl_submit DATE NOT NULL,
    isi TEXT NOT NULL,
    kategori VARCHAR(100),
    keyword VARCHAR(255),

    CONSTRAINT fk_puisi_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);