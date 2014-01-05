package com.googlecode.diskaro.library;

import java.sql.*;

public class Genre extends TagCore {
	protected String getTable() {
		return "genres";
	}
	protected String getRelationshipTable() {
		return "subGenres";
	}
	
	public Genre(int id) throws SQLException {
		super(id);
	}
	
	public Genre(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new genre entry to the database
	 */
	public static Genre add(String name) throws SQLException {
		add(name, "genres");
		return new Genre(name);
	}
}
