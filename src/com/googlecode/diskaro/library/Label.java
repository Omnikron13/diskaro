package com.googlecode.diskaro.library;

import java.sql.*;

public class Label extends TagCore {
	protected String getTable() {
		return "labels";
	}
	protected String getRelationshipTable() {
		return "subLabels";
	}
	
	public Label(int id) throws SQLException {
		super(id);
	}
	
	public Label(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new Label entry to the database
	 */
	public static Label add(String name) throws SQLException {
		add(name, "labels");
		return new Label(name);
	}
}
