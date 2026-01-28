package com.example.Community.Platform.DTO.Pagging;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeCursorPageResponse<T> {
    private List<T> content;
    private LocalDateTime nextCursor;  // Timestamp of the last item, null if no more pages
    private boolean hasNext;
    private int size;
}
