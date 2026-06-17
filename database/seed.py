import os
import sys
from datetime import datetime, timezone
from uuid import UUID, uuid4

# Add the parent directory to the path so we can import from database
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Base, SessionLocal, User, Session, UploadedFile, DocumentChunk, Message

def seed_database():
    """Seed the database with realistic sample data."""
    session = SessionLocal()
    
    try:
        print("Starting database seeding...")
        
        # Clear existing data in reverse order of dependencies
        session.query(Message).delete()
        session.query(DocumentChunk).delete()
        session.query(UploadedFile).delete()
        session.query(Session).delete()
        session.query(User).delete()
        session.commit()
        
        # Create Users (parent table)
        users = [
            User(
                id=UUID('11111111-1111-1111-1111-111111111111'),
                username='alice_johnson',
                created_at=datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
            ),
            User(
                id=UUID('22222222-2222-2222-2222-222222222222'),
                username='bob_smith',
                created_at=datetime(2024, 2, 20, 14, 45, 0, tzinfo=timezone.utc)
            ),
            User(
                id=UUID('33333333-3333-3333-3333-333333333333'),
                username='charlie_wong',
                created_at=datetime(2024, 3, 10, 9, 15, 0, tzinfo=timezone.utc)
            )
        ]
        session.add_all(users)
        session.commit()
        print(f"Created {len(users)} users")
        
        # Create Sessions (child of Users)
        sessions = [
            Session(
                id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                user_id=UUID('11111111-1111-1111-1111-111111111111'),
                name='Project Analysis',
                created_at=datetime(2024, 3, 1, 11, 0, 0, tzinfo=timezone.utc)
            ),
            Session(
                id=UUID('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
                user_id=UUID('11111111-1111-1111-1111-111111111111'),
                name='Research Notes',
                created_at=datetime(2024, 3, 5, 15, 30, 0, tzinfo=timezone.utc)
            ),
            Session(
                id=UUID('cccccccc-cccc-cccc-cccc-cccccccccccc'),
                user_id=UUID('22222222-2222-2222-2222-222222222222'),
                name='Meeting Summary',
                created_at=datetime(2024, 3, 8, 13, 20, 0, tzinfo=timezone.utc)
            )
        ]
        session.add_all(sessions)
        session.commit()
        print(f"Created {len(sessions)} sessions")
        
        # Create UploadedFiles (child of Sessions)
        uploaded_files = [
            UploadedFile(
                id=UUID('dddddddd-dddd-dddd-dddd-dddddddddddd'),
                session_id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                filename='quarterly_report.pdf',
                uploaded_at=datetime(2024, 3, 1, 11, 5, 0, tzinfo=timezone.utc)
            ),
            UploadedFile(
                id=UUID('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
                session_id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                filename='market_analysis.docx',
                uploaded_at=datetime(2024, 3, 1, 11, 10, 0, tzinfo=timezone.utc)
            ),
            UploadedFile(
                id=UUID('ffffffff-ffff-ffff-ffff-ffffffffffff'),
                session_id=UUID('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
                filename='research_paper.pdf',
                uploaded_at=datetime(2024, 3, 5, 15, 35, 0, tzinfo=timezone.utc)
            )
        ]
        session.add_all(uploaded_files)
        session.commit()
        print(f"Created {len(uploaded_files)} uploaded files")
        
        # Create DocumentChunks (child of UploadedFiles)
        document_chunks = [
            DocumentChunk(
                id=UUID('gggggggg-gggg-gggg-gggg-gggggggggggg'),
                uploaded_file_id=UUID('dddddddd-dddd-dddd-dddd-dddddddddddd'),
                chunk_index=0,
                content='Executive Summary: The quarterly report shows a 15% increase in revenue compared to the previous quarter.',
                embedding=None,
                row_start=1,
                row_end=5
            ),
            DocumentChunk(
                id=UUID('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
                uploaded_file_id=UUID('dddddddd-dddd-dddd-dddd-dddddddddddd'),
                chunk_index=1,
                content='Financial Highlights: Gross margin improved to 42%, operating expenses remained stable at $2.3M.',
                embedding=None,
                row_start=6,
                row_end=10
            ),
            DocumentChunk(
                id=UUID('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'),
                uploaded_file_id=UUID('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
                chunk_index=0,
                content='Market Overview: The technology sector continues to show strong growth, with AI investments increasing by 25% year-over-year.',
                embedding=None,
                row_start=1,
                row_end=8
            )
        ]
        session.add_all(document_chunks)
        session.commit()
        print(f"Created {len(document_chunks)} document chunks")
        
        # Create Messages (child of Sessions)
        messages = [
            Message(
                id=UUID('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'),
                session_id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                role='user',
                content='Can you summarize the key findings from the quarterly report?',
                source_citation=None,
                created_at=datetime(2024, 3, 1, 11, 15, 0, tzinfo=timezone.utc)
            ),
            Message(
                id=UUID('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),
                session_id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                role='assistant',
                content='Based on the quarterly report, revenue increased by 15% and gross margin improved to 42%. Operating expenses remained stable at $2.3M.',
                source_citation='quarterly_report.pdf, pages 1-2',
                created_at=datetime(2024, 3, 1, 11, 16, 0, tzinfo=timezone.utc)
            ),
            Message(
                id=UUID('llllllll-llll-llll-llll-llllllllllll'),
                session_id=UUID('cccccccc-cccc-cccc-cccc-cccccccccccc'),
                role='user',
                content='What were the main action items from the meeting?',
                source_citation=None,
                created_at=datetime(2024, 3, 8, 13, 25, 0, tzinfo=timezone.utc)
            )
        ]
        session.add_all(messages)
        session.commit()
        print(f"Created {len(messages)} messages")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"Error during database seeding: {e}")
        raise
    finally:
        session.close()

if __name__ == '__main__':
    seed_database()