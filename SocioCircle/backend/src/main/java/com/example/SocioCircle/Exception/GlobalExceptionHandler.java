package com.example.SocioCircle.Exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        logger.error("File upload size exceeded", exc);
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("File too large!");
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handleIOException(IOException exc) {
        logger.error("IO Error during request processing", exc);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing file upload: " + exc.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception exc) {
        logger.error("Unexpected error occurred", exc);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + exc.getMessage());
    }
}
