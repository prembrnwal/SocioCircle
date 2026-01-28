package com.example.Community.Platform.DTO.Pagging;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CursorPageResponse<T> {
    private List<T> content;
    private Long nextCursor;  // ID of the last item, null if no more pages
    private boolean hasNext;
    private int size;
}
