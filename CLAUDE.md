# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ping pong game project called "唐林的乒乓球" (Tang Lin's Ping Pong). The project is currently in planning phase with only a requirements document (todo.list.md) present.

## Game Requirements Summary

- **Game Name**: 唐林的乒乓球 (Tang Lin's Ping Pong)
- **Controls**: 
  - Left player: A (up), Z (down)
  - Right player: ↑ (up), ↓ (down)
- **Scoring**: First to 10 points wins
- **Features**: 
  - Ball trail effects
  - Increasing ball speed on paddle hits
  - Start screen with game title and instructions
  - Real-time scoreboard
  - Victory screen with restart/exit options

## Development Notes

Since this is a new project with no existing code, the implementation approach should be:

1. **Technology Stack**: Choose web-based implementation (HTML5 Canvas + JavaScript) for cross-platform compatibility
2. **File Structure**: Create organized structure with separate files for game logic, rendering, input handling, and UI
3. **Game Loop**: Implement standard game loop with update/render cycles
4. **Physics**: Simple 2D physics for ball movement and collision detection
5. **Visual Effects**: Implement ball trail using canvas techniques or particle systems

## Key Implementation Areas

- Game state management (start screen, playing, game over)
- Input handling for keyboard controls
- Collision detection between ball and paddles/walls
- Score tracking and win condition checking
- Visual effects for ball trails
- UI rendering for scores and game states

## Testing

Since no test framework is currently set up, manual testing should focus on:
- Control responsiveness
- Collision accuracy
- Score tracking correctness
- Visual effect performance
- Game state transitions

### 其他规则
1. 总是使用中文
2. 每次新需求开发前, 提交一个commit, 提交内容待修改内容(todo.list.md目), 开发结束后提交一个commit,提交内容为已开发的功能描述
3. 每次需求读取todo.list.md中的需求实现, 完成后写入done.list.md,更新changelog.md